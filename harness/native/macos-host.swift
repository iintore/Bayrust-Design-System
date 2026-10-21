// Read-only host data for the harness, taken from this Mac via AppKit:
//   macos-host apps            → installed applications (JSON)
//   macos-host running         → running regular applications (JSON)
//   macos-host icon <path> <px> <out.png>  → the system icon for a file/app, or the image itself, as PNG
//   macos-host catalog-image <bundle.app> <name> <px> <out.png|.pdf> → an image from the bundle's Assets.car
import AppKit

func json(_ v: Any) { print(String(data: try! JSONSerialization.data(withJSONObject: v, options: [.sortedKeys]), encoding: .utf8)!) }

func appEntry(_ url: URL) -> [String: Any]? {
  guard let bundle = Bundle(url: url) else { return nil }
  let info = bundle.localizedInfoDictionary ?? [:]
  let base = bundle.infoDictionary ?? [:]
  let display = FileManager.default.displayName(atPath: url.path).replacingOccurrences(of: ".app", with: "")
  var e: [String: Any] = [
    "path": url.path, "raycastAppId": url.path, "name": url.deletingPathExtension().lastPathComponent,
    "contentType": ["field0": 2],
  ]
  if let id = bundle.bundleIdentifier { e["applicationId"] = id }
  if display != e["name"] as? String { e["localizedName"] = display }
  if let n = (info["CFBundleName"] ?? base["CFBundleName"]) as? String { e["bundleName"] = n }
  if let x = base["CFBundleExecutable"] as? String { e["executableName"] = x }
  return e
}

let args = CommandLine.arguments
switch args.count > 1 ? args[1] : "" {
case "apps":
  let fm = FileManager.default
  let home = NSHomeDirectory()
  let roots = ["/Applications", "/Applications/Utilities", "/System/Applications", "/System/Applications/Utilities",
               "/System/Library/CoreServices/Applications", home + "/Applications"]
  var seen = Set<String>(), out: [[String: Any]] = []
  for r in roots {
    for name in (try? fm.contentsOfDirectory(atPath: r)) ?? [] where name.hasSuffix(".app") {
      let url = URL(fileURLWithPath: r).appendingPathComponent(name).resolvingSymlinksInPath()
      if seen.insert(url.path).inserted, let e = appEntry(url) { out.append(e) }
    }
  }
  json(out)
case "running":
  json(NSWorkspace.shared.runningApplications.filter { $0.activationPolicy == .regular }.compactMap { a -> [String: Any]? in
    guard let url = a.bundleURL else { return nil }
    return ["path": url.path, "bundleId": a.bundleIdentifier ?? "", "name": a.localizedName ?? "", "pid": Int(a.processIdentifier),
            "isActive": a.isActive, "isHidden": a.isHidden]
  })
case "icon":
  let path = args[2], px = CGFloat(Double(args[3]) ?? 64)
  let isImage = ["png", "jpg", "jpeg", "gif", "tiff", "heic", "webp", "icns", "pdf"].contains((path as NSString).pathExtension.lowercased())
  let src = (isImage ? NSImage(contentsOfFile: path) : nil) ?? NSWorkspace.shared.icon(forFile: path)
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(px), pixelsHigh: Int(px), bitsPerSample: 8, samplesPerPixel: 4,
                             hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
  NSGraphicsContext.current?.imageInterpolation = .high
  src.draw(in: NSRect(x: 0, y: 0, width: px, height: px), from: .zero, operation: .copy, fraction: 1)
  NSGraphicsContext.restoreGraphicsState()
  try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: args[4]))
case "catalog-image":
  // macos-host catalog-image <bundle.app> <asset name> <px> <out.png|out.pdf> — exact image from the bundle's Assets.car
  let bundle = Bundle(path: args[2])!, name = args[3], px = CGFloat(Double(args[4]) ?? 64), out = args[5]
  guard let img = bundle.image(forResource: name) else { FileHandle.standardError.write("missing \(name)\n".data(using: .utf8)!); exit(1) }
  if out.hasSuffix(".pdf") {
    var box = CGRect(x: 0, y: 0, width: img.size.width, height: img.size.height)
    let ctx = CGContext(URL(fileURLWithPath: out) as CFURL, mediaBox: &box, nil)!
    ctx.beginPDFPage(nil)
    NSGraphicsContext.saveGraphicsState(); NSGraphicsContext.current = NSGraphicsContext(cgContext: ctx, flipped: false)
    img.draw(in: box); NSGraphicsContext.restoreGraphicsState()
    ctx.endPDFPage(); ctx.closePDF()
  } else {
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(px), pixelsHigh: Int(px), bitsPerSample: 8, samplesPerPixel: 4,
                               hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState(); NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    NSGraphicsContext.current?.imageInterpolation = .high
    img.draw(in: NSRect(x: 0, y: 0, width: px, height: px)); NSGraphicsContext.restoreGraphicsState()
    try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
  }
default:
  FileHandle.standardError.write("usage: macos-host apps|running|icon <path> <px> <out>\n".data(using: .utf8)!); exit(2)
}
