// Prints Raycast's current windows as JSON lines: number, title, width, height, onscreen.
import CoreGraphics
import Foundation
for w in CGWindowListCopyWindowInfo([.optionAll], kCGNullWindowID) as? [[String: Any]] ?? [] where (w[kCGWindowOwnerName as String] as? String) == "Raycast" {
  let b = w[kCGWindowBounds as String] as? [String: Double] ?? [:]
  let o: [String: Any] = ["n": w[kCGWindowNumber as String] ?? 0, "t": w[kCGWindowName as String] ?? "", "w": b["Width"] ?? 0, "h": b["Height"] ?? 0, "on": w[kCGWindowIsOnscreen as String] ?? false]
  print(String(data: try! JSONSerialization.data(withJSONObject: o), encoding: .utf8)!)
}
