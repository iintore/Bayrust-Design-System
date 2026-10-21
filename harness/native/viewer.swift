// Native viewer: hosts a harness page in WKWebView (Raycast's own engine) inside an NSGlassEffectView window,
// so WebKit-only styling (-apple-visual-effect glass) and native materials render as in Raycast, then
// captures the window with screencapture.
// Usage: viewer <url> <width> <height> <out.png> [steps.json]
//   steps.json: [{"wait":ms} | {"js":"…"} | {"keys":"text"} | {"key":"return|tab|escape|down|up", "mods":["cmd"]}]
import AppKit
import WebKit

let a = CommandLine.arguments
let url = URL(string: a[1])!, width = CGFloat(Double(a[2])!), height = CGFloat(Double(a[3])!), out = a[4]
let steps: [[String: Any]] = a.count > 5 ? (try! JSONSerialization.jsonObject(with: Data(contentsOf: URL(fileURLWithPath: a[5])))) as! [[String: Any]] : []

final class Viewer: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate {
  var window: NSWindow!, web: WKWebView!
  var children: [(panel: NSPanel, web: WKWebView, url: URL)] = []
  // window.open() from the UI = a native child panel (action panel, menus). The UI renders into its document;
  // the host sizes it to #native-view-root and anchors it at referenceX/Y with side/align (offsets 0 in code).
  func webView(_ w: WKWebView, createWebViewWith c: WKWebViewConfiguration, for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
    let child = WKWebView(frame: NSRect(x: 0, y: 0, width: 350, height: 280), configuration: c)
    child.setValue(false, forKey: "drawsBackground"); child.setValue(true, forKey: "useSystemAppearance")
    let panel = NSPanel(contentRect: child.frame, styleMask: [.titled, .fullSizeContentView, .nonactivatingPanel], backing: .buffered, defer: false)
    panel.titlebarAppearsTransparent = true; panel.titleVisibility = .hidden; panel.isOpaque = false; panel.backgroundColor = .clear
    [.closeButton, .miniaturizeButton, .zoomButton].forEach { panel.standardWindowButton($0)?.isHidden = true }
    panel.appearance = window.appearance
    let glass = NSGlassEffectView(frame: child.frame); glass.contentView = child; panel.contentView = glass
    panel.orderBack(nil)
    children.append((panel, child, action.request.url ?? URL(string: "about:blank")!))
    return child
  }
  func layoutChildren() async {
    for c in children {
      guard let r = try? await c.web.evaluateJavaScript("(() => { const b = document.getElementById('native-view-root')?.getBoundingClientRect(); return b ? [b.width, b.height] : null })()") as? [Double] else { continue }
      let q = URLComponents(url: c.url, resolvingAgainstBaseURL: false)?.queryItems ?? []
      func v(_ k: String) -> String? { q.first { $0.name == k }?.value }
      let rx = Double(v("referenceX") ?? "0")!, ry = Double(v("referenceY") ?? "0")!, rw = Double(v("referenceWidth") ?? "0")!, rh = Double(v("referenceHeight") ?? "0")!
      let w = r[0], h = r[1], side = v("side") ?? "bottom", align = v("align") ?? "start"
      var x = align == "end" ? rx + rw - w : align == "center" ? rx + rw / 2 - w / 2 : rx
      var yTop = side == "top" ? ry - h : ry + rh // in web (top-left) coordinates of the parent
      if side == "left" { x = rx - w; yTop = ry } else if side == "right" { x = rx + rw; yTop = ry }
      let f = window.frame
      c.panel.setFrame(NSRect(x: f.minX + x, y: f.maxY - yTop - h, width: w, height: h), display: true)
      c.panel.order(.above, relativeTo: window.windowNumber)
    }
  }
  func applicationDidFinishLaunching(_ n: Notification) {
    let config = WKWebViewConfiguration()
    // As Raycast's host does: enable WebKit's UseSystemAppearance so -apple-visual-effect (native glass) applies.
    if let features = (WKPreferences.self as AnyObject).perform(NSSelectorFromString("_features"))?.takeUnretainedValue() as? [NSObject],
       let f = features.first(where: { ($0.value(forKey: "key") as? String) == "UseSystemAppearance" }) {
      _ = config.preferences.perform(NSSelectorFromString("_setEnabled:forFeature:"), with: true, with: f)
    }
    let screen = NSScreen.main!.visibleFrame
    window = UnclampedWindow(contentRect: NSRect(x: screen.maxX - width - 20, y: screen.minY + 20, width: width, height: height),
                      styleMask: [.titled, .fullSizeContentView], backing: .buffered, defer: false)
    window.titlebarAppearsTransparent = true; window.titleVisibility = .hidden
    // Standard window controls only where the real window shows them (VIEWER_CHROME=standard).
    let standardChrome = ProcessInfo.processInfo.environment["VIEWER_CHROME"] == "standard"
    if standardChrome { window.styleMask.insert([.closable, .miniaturizable, .resizable]) }
    [.closeButton, .miniaturizeButton, .zoomButton].forEach { window.standardWindowButton($0)?.isHidden = !standardChrome }
    window.isOpaque = false; window.backgroundColor = .clear
    window.appearance = NSAppearance(named: .darkAqua)
    web = WKWebView(frame: NSRect(x: 0, y: 0, width: width, height: height), configuration: config)
    web.setValue(false, forKey: "drawsBackground")
    web.setValue(true, forKey: "useSystemAppearance") // KVC → -[WKWebView _setUseSystemAppearance:], as Raycast's host does
    web.navigationDelegate = self; web.uiDelegate = self
    let glass = NSGlassEffectView(frame: web.frame)
    glass.contentView = web
    window.contentView = glass
    window.orderBack(nil)
    web.load(URLRequest(url: url))
  }
  func webView(_ w: WKWebView, didFinish n: WKNavigation!) {
    Task { @MainActor in
      try? await Task.sleep(nanoseconds: 3_000_000_000)
      for s in steps {
        if let ms = s["wait"] as? Double { try? await Task.sleep(nanoseconds: UInt64(ms * 1_000_000)) }
        if let js = s["js"] as? String { _ = try? await web.evaluateJavaScript(js) }
        if let label = s["clickText"] as? String {
          // Real mouse click (NSEvent) at the center of the element whose own text is exactly `label`.
          let js = "(() => { const el = [...document.querySelectorAll('body *')].find(e => e.children.length === 0 && e.textContent.trim() === \(String(data: try! JSONSerialization.data(withJSONObject: [label]), encoding: .utf8)!)[0]); if (!el) return null; const r = el.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()"
          if let pt = try? await web.evaluateJavaScript(js) as? [Double] { click(x: pt[0], y: pt[1]) }
        }
        if let js = s["print"] as? String { print("PRINT:", (try? await web.evaluateJavaScript(js)) ?? "nil") }
        if let text = s["keys"] as? String { for ch in text { press(String(ch), code: 0) }; try? await Task.sleep(nanoseconds: 400_000_000) }
        if let k = s["key"] as? String { press(k, code: ["return": 36, "tab": 48, "escape": 53, "down": 125, "up": 126, "k": 40][k] ?? 0, mods: s["mods"] as? [String] ?? []) }
      }
      try? await Task.sleep(nanoseconds: 800_000_000)
      await layoutChildren()
      try? await Task.sleep(nanoseconds: 700_000_000)
      shot(window, out)
      // Child panels: image + frame relative to the main window (for compositing).
      var meta: [[String: Any]] = []
      for (i, c) in children.enumerated() where c.panel.frame.width > 1 {
        let feature = URLComponents(url: c.url, resolvingAgainstBaseURL: false)?.queryItems?.first { $0.name == "feature" }?.value ?? "panel"
        let file = out.replacingOccurrences(of: ".png", with: "--\(feature)\(i > 0 ? "-\(i)" : "").png")
        shot(c.panel, file)
        meta.append(["file": (file as NSString).lastPathComponent, "feature": feature, "x": c.panel.frame.minX - window.frame.minX, "y": window.frame.maxY - c.panel.frame.maxY, "w": c.panel.frame.width, "h": c.panel.frame.height])
      }
      if !meta.isEmpty { try? JSONSerialization.data(withJSONObject: meta, options: .prettyPrinted).write(to: URL(fileURLWithPath: out.replacingOccurrences(of: ".png", with: "--panels.json"))) }
      NSApp.terminate(nil)
    }
  }
  func shot(_ w: NSWindow, _ file: String) {
    let p = Process(); p.launchPath = "/usr/sbin/screencapture"; p.arguments = ["-x", "-o", "-l", String(w.windowNumber), file]
    try? p.run(); p.waitUntilExit()
  }
  func click(x: Double, y: Double) {
    window.makeKeyAndOrderFront(nil)
    let p = NSPoint(x: x, y: Double(window.contentView!.frame.height) - y)
    for type in [NSEvent.EventType.leftMouseDown, .leftMouseUp] {
      if let e = NSEvent.mouseEvent(with: type, location: p, modifierFlags: [], timestamp: ProcessInfo.processInfo.systemUptime, windowNumber: window.windowNumber, context: nil, eventNumber: 0, clickCount: 1, pressure: 1) { window.sendEvent(e) }
    }
  }
  func press(_ chars: String, code: UInt16, mods: [String] = []) {
    window.makeKeyAndOrderFront(nil); window.makeFirstResponder(web)
    var flags: NSEvent.ModifierFlags = []
    if mods.contains("cmd") { flags.insert(.command) }; if mods.contains("shift") { flags.insert(.shift) }; if mods.contains("alt") { flags.insert(.option) }
    let c = ["return": "\r", "tab": "\t", "escape": "\u{1b}"][chars] ?? chars
    for type in [NSEvent.EventType.keyDown, .keyUp] {
      if let e = NSEvent.keyEvent(with: type, location: .zero, modifierFlags: flags, timestamp: 0, windowNumber: window.windowNumber, context: nil,
                                  characters: c, charactersIgnoringModifiers: c, isARepeat: false, keyCode: code) { window.sendEvent(e) }
    }
  }
}
let app = NSApplication.shared
let d = Viewer(); app.delegate = d
app.setActivationPolicy(.accessory)
app.run()

/// AppKit keeps titled windows inside the screen's visible area (below the menu bar, above the Dock).
/// A full-screen window covers the whole display, so the viewer lets the requested frame stand.
final class UnclampedWindow: NSWindow {
  override func constrainFrameRect(_ frameRect: NSRect, to screen: NSScreen?) -> NSRect { frameRect }
}
