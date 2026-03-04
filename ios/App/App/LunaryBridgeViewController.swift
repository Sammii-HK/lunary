import UIKit
import Capacitor
import WebKit
import RevenuecatPurchasesCapacitor

class LunaryBridgeViewController: CAPBridgeViewController, WKNavigationDelegate {

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        // Explicitly register plugins that may be stripped by the Release linker.
        // NSClassFromString-based discovery fails for Swift classes in Release builds.
        bridge?.registerPluginType(PurchasesPlugin.self)
        bridge?.registerPluginType(SignInWithApplePlugin.self)
        NSLog("[Lunary] PurchasesPlugin + SignInWithApplePlugin registered with bridge")
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        // Set ourselves as the navigation delegate
        webView?.navigationDelegate = self

        // Register the native message handler for widget data
        webView?.configuration.userContentController.add(
            WidgetDataBridge.shared,
            name: "widgetBridge"
        )
        NSLog("[Lunary] viewDidLoad complete — widgetBridge registered")
    }

    // MARK: - WKNavigationDelegate

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }

        // Allow all lunary.app URLs to navigate within the WebView
        if let host = url.host, host.contains("lunary.app") {
            print("[Lunary] Allowing internal navigation to: \(url.absoluteString)")
            decisionHandler(.allow)
            return
        }

        // Allow localhost and LAN IPs for development
        if let host = url.host, host == "localhost" || host == "127.0.0.1"
            || host.hasPrefix("192.168.") || host.hasPrefix("10.") || host.hasPrefix("172.") {
            NSLog("[Lunary] Allowing dev server navigation to: \(url.absoluteString)")
            decisionHandler(.allow)
            return
        }

        // For capacitor:// and ionic:// schemes (internal)
        if let scheme = url.scheme, scheme == "capacitor" || scheme == "ionic" {
            print("[Lunary] Allowing Capacitor scheme: \(url.absoluteString)")
            decisionHandler(.allow)
            return
        }

        // All external http/https URLs should open in Safari (link taps and JS navigations)
        if let scheme = url.scheme, scheme == "http" || scheme == "https" {
            print("[Lunary] Opening external link in Safari: \(url.absoluteString)")
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
            decisionHandler(.cancel)
            return
        }

        // Default: allow (e.g. data:, blob:, mailto:)
        print("[Lunary] Allowing navigation (default): \(url.absoluteString)")
        decisionHandler(.allow)
    }
}
