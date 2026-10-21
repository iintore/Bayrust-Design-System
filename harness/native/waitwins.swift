// Waits for new Raycast windows (any Space/display), records each one's exact size and a screenshot.
// Exits when `want` distinct new windows were seen or after `seconds`. Usage: waitwins <outDir> <want> <seconds>
import CoreGraphics
import Foundation
let a = CommandLine.arguments, out = a[1], want = Int(a[2]) ?? 4, seconds = Double(a[3]) ?? 1200
try? FileManager.default.createDirectory(atPath: out, withIntermediateDirectories: true)
let ignore: Set<String> = ["Main Window", "Welcome"]
var seen: [Int: (String, Int, Int)] = [:]
let start = Date()
func windows() -> [[String: Any]] { CGWindowListCopyWindowInfo([.optionAll], kCGNullWindowID) as? [[String: Any]] ?? [] }
let baseline = Set(windows().compactMap { ($0[kCGWindowOwnerName as String] as? String) == "Raycast" ? $0[kCGWindowNumber as String] as? Int : nil })
while Date().timeIntervalSince(start) < seconds && seen.count < want {
  for w in windows() where (w[kCGWindowOwnerName as String] as? String) == "Raycast" {
    let num = w[kCGWindowNumber as String] as? Int ?? 0
    let b = w[kCGWindowBounds as String] as? [String: Double] ?? [:]
    let wd = Int(b["Width"] ?? 0), ht = Int(b["Height"] ?? 0)
    let title = w[kCGWindowName as String] as? String ?? ""
    if baseline.contains(num) || ignore.contains(title) || wd < 300 || ht < 200 || seen[num] != nil { continue }
    Thread.sleep(forTimeInterval: 1.5) // let it finish opening/animating, then re-read its final size
    let again = windows().first { ($0[kCGWindowNumber as String] as? Int) == num }
    let b2 = again?[kCGWindowBounds as String] as? [String: Double] ?? b
    let W = Int(b2["Width"] ?? 0), H = Int(b2["Height"] ?? 0)
    let safe = (title.isEmpty ? "untitled" : title).replacingOccurrences(of: "/", with: "-")
    let file = "\(out)/\(safe)-\(W)x\(H)-w\(num).png"
    let p = Process(); p.launchPath = "/usr/sbin/screencapture"; p.arguments = ["-x", "-o", "-l", String(num), file]
    try? p.run(); p.waitUntilExit()
    seen[num] = (title, W, H)
    print("WINDOW \"\(title)\" \(W)x\(H) win=\(num) -> \((file as NSString).lastPathComponent)"); fflush(stdout)
  }
  Thread.sleep(forTimeInterval: 0.5)
}
print("DONE \(seen.count) window(s)")
