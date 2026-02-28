import Foundation
import Capacitor
import AuthenticationServices

@objc(SignInWithApplePlugin)
public class SignInWithApplePlugin: CAPPlugin, CAPBridgedPlugin {
    @objc public let identifier = "SignInWithApplePlugin"
    @objc public let jsName = "SignInWithApple"
    @objc public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authorize", returnType: CAPPluginReturnPromise)
    ]

    private var currentCall: CAPPluginCall?

    @objc func authorize(_ call: CAPPluginCall) {
        self.currentCall = call

        DispatchQueue.main.async {
            let provider = ASAuthorizationAppleIDProvider()
            let request = provider.createRequest()
            request.requestedScopes = [.fullName, .email]
            request.nonce = call.getString("nonce")

            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = self
            controller.presentationContextProvider = self
            controller.performRequests()
        }
    }
}

extension SignInWithApplePlugin: ASAuthorizationControllerDelegate {
    public func authorizationController(controller: ASAuthorizationController,
                                        didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let identityToken = appleIDCredential.identityToken,
              let tokenString = String(data: identityToken, encoding: .utf8) else {
            currentCall?.reject("Failed to get identity token")
            return
        }

        let fullName = appleIDCredential.fullName
        currentCall?.resolve([
            "response": [
                "identityToken": tokenString,
                "user": appleIDCredential.user,
                "email": appleIDCredential.email ?? "",
                "givenName": fullName?.givenName ?? "",
                "familyName": fullName?.familyName ?? ""
            ]
        ])
        currentCall = nil
    }

    public func authorizationController(controller: ASAuthorizationController,
                                        didCompleteWithError error: Error) {
        let nsError = error as NSError
        if nsError.code == ASAuthorizationError.canceled.rawValue {
            currentCall?.reject("AuthorizationError error 1001")
        } else if nsError.code == ASAuthorizationError.unknown.rawValue {
            currentCall?.reject("AuthorizationError error 1000")
        } else {
            currentCall?.reject(error.localizedDescription)
        }
        currentCall = nil
    }
}

extension SignInWithApplePlugin: ASAuthorizationControllerPresentationContextProviding {
    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return bridge?.webView?.window ?? UIWindow()
    }
}
