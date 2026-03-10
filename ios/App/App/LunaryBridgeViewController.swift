import UIKit
import Capacitor
import WebKit
import RevenuecatPurchasesCapacitor

class LunaryBridgeViewController: CAPBridgeViewController {

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

        // Enable Safari Web Inspector for debugging
        if #available(iOS 16.4, *) {
            webView?.isInspectable = true
        }

        // Register the native message handler for widget data
        webView?.configuration.userContentController.add(
            WidgetDataBridge.shared,
            name: "widgetBridge"
        )

        NSLog("[Lunary] viewDidLoad complete — widgetBridge registered")
    }

    // MARK: - URL filtering via webView override
    // Instead of overriding navigationDelegate (which breaks Capacitor's bridge),
    // use the open(url:) method to intercept external links.
}
