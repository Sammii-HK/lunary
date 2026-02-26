import UIKit
import Capacitor
import RevenueCat

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // RevenueCat — initialise before any IAP calls
        // Public SDK key is safe to commit; it only allows fetching offerings + making purchases
        Purchases.logLevel = .error
        Purchases.configure(withAPIKey: "appl_glpoURCDefowlFmMDhrxEgYnngJ")

        // Force reference to prevent linker stripping
        _ = WidgetBridgePlugin.self

        // Debug: print to verify the class exists
        print("[Lunary] WidgetBridgePlugin class loaded: \(WidgetBridgePlugin.self)")

        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, open: userActivity.webpageURL ?? URL(string: "")!, options: [:])
    }

}
