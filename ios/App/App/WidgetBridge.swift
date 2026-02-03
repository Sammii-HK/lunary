import Foundation
import UIKit
import WidgetKit
import Capacitor
import WebKit

@objc public class WidgetDataBridge: NSObject, WKScriptMessageHandler {
    static let shared = WidgetDataBridge()

    private let appGroupId = "group.app.lunary"
    private let dataKey = "widgetData"

    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print("[WidgetDataBridge] Received message: \(message.name)")
        print("[WidgetDataBridge] Message body: \(message.body)")

        guard let body = message.body as? [String: Any] else {
            print("[WidgetDataBridge] Invalid message format")
            return
        }

        let action = body["action"] as? String ?? ""

        if action == "setWidgetData" {
            if let data = body["data"] as? [String: Any] {
                saveWidgetData(data)
            } else {
                print("[WidgetDataBridge] Missing data in message")
            }
        }
    }

    func saveWidgetData(_ data: [String: Any]) {
        print("[WidgetDataBridge] Saving widget data...")

        guard let sharedDefaults = UserDefaults(suiteName: appGroupId) else {
            print("[WidgetDataBridge] Could not access App Group")
            return
        }

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: data, options: [])
            sharedDefaults.set(jsonData, forKey: dataKey)
            sharedDefaults.synchronize()

            WidgetCenter.shared.reloadAllTimelines()
            print("[WidgetDataBridge] Data saved and widgets reloaded")
        } catch {
            print("[WidgetDataBridge] Error: \(error.localizedDescription)")
        }
    }
}

// Capacitor Plugin with CAPBridgedPlugin protocol for Capacitor 8
@objc(WidgetBridgePlugin)
public class WidgetBridgePlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "WidgetBridgePlugin"
    public let jsName = "WidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setWidgetData", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getWidgetData", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reloadWidgets", returnType: CAPPluginReturnPromise),
    ]

    private let appGroupId = "group.app.lunary"
    private let dataKey = "widgetData"

    override public func load() {
        print("[WidgetBridgePlugin] Plugin loaded!")
    }

    @objc func setWidgetData(_ call: CAPPluginCall) {
        print("[WidgetBridgePlugin] setWidgetData called")

        guard let data = call.options as? [String: Any],
              let widgetData = data["data"] as? [String: Any] else {
            print("[WidgetBridgePlugin] Missing data")
            call.resolve(["success": false, "error": "Missing data parameter"])
            return
        }

        guard let sharedDefaults = UserDefaults(suiteName: appGroupId) else {
            call.resolve(["success": false, "error": "Could not access App Group"])
            return
        }

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: widgetData, options: [])
            sharedDefaults.set(jsonData, forKey: dataKey)
            sharedDefaults.synchronize()

            WidgetCenter.shared.reloadAllTimelines()

            print("[WidgetBridgePlugin] Data saved successfully")
            call.resolve(["success": true])
        } catch {
            print("[WidgetBridgePlugin] Error: \(error.localizedDescription)")
            call.resolve(["success": false, "error": "Failed to serialize: \(error.localizedDescription)"])
        }
    }

    @objc func getWidgetData(_ call: CAPPluginCall) {
        guard let sharedDefaults = UserDefaults(suiteName: appGroupId) else {
            call.resolve(["success": false, "error": "Could not access App Group"])
            return
        }

        guard let jsonData = sharedDefaults.data(forKey: dataKey) else {
            call.resolve(["success": true, "data": NSNull()])
            return
        }

        do {
            if let data = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any] {
                call.resolve(["success": true, "data": data])
            } else {
                call.resolve(["success": true, "data": NSNull()])
            }
        } catch {
            call.resolve(["success": false, "error": "Failed to deserialize: \(error.localizedDescription)"])
        }
    }

    @objc func reloadWidgets(_ call: CAPPluginCall) {
        WidgetCenter.shared.reloadAllTimelines()
        call.resolve(["success": true])
    }
}
