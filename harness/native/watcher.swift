// Read-only ground-truth watcher: while running, captures each on-screen Raycast window (screencapture -l)
// with its exact size, a few times per window, into research/ground-truth/auto/. Usage: watcher <outDir> <seconds>
import CoreGraphics
import Foundation
let out = CommandLine.arguments[1], seconds = Double(CommandLine.arguments[2]) ?? 900
try? FileManager.default.createDirectory(atPath: out, withIntermediateDirectories: true)
var shots: [String: Int] = [:], lastHash: [String: Int] = [:]
let start = Date()
var log = ""
while Date().timeIntervalSince(start) < seconds {
  let list = CGWindowListCopyWindowInfo([.optionOnScreenOnly], kCGNullWindowID) as? [[String: Any]] ?? []
  for w in list where (w[kCGWindowOwnerName as String] as? String) == "Raycast" {
    let b = w[kCGWindowBounds as String] as? [String: Double] ?? [:]
    let width = Int(b["Width"] ?? 0), height = Int(b["Height"] ?? 0)
    if width < 120 || height < 60 { continue }
    let num = w[kCGWindowNumber as String] as? Int ?? 0, layer = w[kCGWindowLayer as String] as? Int ?? 0
    let title = (w[kCGWindowName as String] as? String ?? "untitled").replacingOccurrences(of: "/", with: "-")
    let key = "\(num)-\(width)x\(height)"
    let n = shots[key, default: 0]
    let now = Int(Date().timeIntervalSince(start))
    if n >= 4 || (n > 0 && now - (lastHash[key] ?? 0) < 3) { continue }
    let file = "\(out)/\(title.isEmpty ? "untitled" : title)-\(width)x\(height)-L\(layer)-w\(num)-\(n).png"
    let p = Process(); p.launchPath = "/usr/sbin/screencapture"; p.arguments = ["-x", "-o", "-l", String(num), file]
    try? p.run(); p.waitUntilExit()
    shots[key] = n + 1; lastHash[key] = now
    log += "\(now)s \(title) \(width)x\(height) x=\(Int(b["X"] ?? 0)) y=\(Int(b["Y"] ?? 0)) layer=\(layer) win=\(num) -> \((file as NSString).lastPathComponent)\n"
    try? log.write(toFile: "\(out)/watch.log", atomically: true, encoding: .utf8)
  }
  Thread.sleep(forTimeInterval: 0.5)
}
