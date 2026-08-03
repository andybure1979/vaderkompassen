import Capacitor
import StoreKit
import UIKit

@objc(VaderkompassenPurchasesPlugin)
public class VaderkompassenPurchasesPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "VaderkompassenPurchasesPlugin"
    public let jsName = "VaderkompassenPurchases"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getSubscriptionStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startSubscription", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "syncPurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openManageSubscription", returnType: CAPPluginReturnPromise)
    ]

    private func productID(_ call: CAPPluginCall) throws -> String {
        guard let value = call.getString("productId")?.trimmingCharacters(in: .whitespacesAndNewlines), !value.isEmpty else {
            throw StoreBridgeError.missingProductID
        }
        return value
    }

    private func periodLabel(_ period: Product.SubscriptionPeriod) -> String {
        let unit: String
        switch period.unit {
        case .day: unit = period.value == 1 ? "dag" : "dagar"
        case .week: unit = period.value == 1 ? "vecka" : "veckor"
        case .month: unit = period.value == 1 ? "månad" : "månader"
        case .year: unit = period.value == 1 ? "år" : "år"
        @unknown default: unit = "period"
        }
        return period.value == 1 ? unit : "\(period.value) \(unit)"
    }

    private func productPayload(_ product: Product) -> JSObject {
        var payload: JSObject = [
            "id": product.id,
            "displayName": product.displayName,
            "description": product.description,
            "displayPrice": product.displayPrice,
            "currencyCode": product.priceFormatStyle.currencyCode,
            "price": NSDecimalNumber(decimal: product.price).doubleValue
        ]
        if let subscription = product.subscription {
            payload["billingPeriod"] = periodLabel(subscription.subscriptionPeriod)
            payload["billingPeriodUnit"] = String(describing: subscription.subscriptionPeriod.unit)
            payload["billingPeriodValue"] = subscription.subscriptionPeriod.value
            if let offer = subscription.introductoryOffer {
                payload["introductoryOffer"] = [
                    "displayPrice": offer.displayPrice,
                    "period": periodLabel(offer.period),
                    "periodCount": offer.periodCount,
                    "paymentMode": String(describing: offer.paymentMode)
                ] as JSObject
            }
        }
        return payload
    }

    private func transactionPayload(_ result: VerificationResult<Transaction>) throws -> JSObject {
        switch result {
        case .verified(let transaction):
            var payload: JSObject = [
                "productId": transaction.productID,
                "transactionId": String(transaction.id),
                "originalTransactionId": String(transaction.originalID),
                "signedTransactionInfo": result.jwsRepresentation,
                "ownershipType": transaction.ownershipType == .familyShared ? "FAMILY_SHARED" : "PURCHASED"
            ]
            if let date = transaction.expirationDate { payload["expiresDate"] = Int(date.timeIntervalSince1970 * 1000) }
            if let date = transaction.revocationDate { payload["revocationDate"] = Int(date.timeIntervalSince1970 * 1000) }
            return payload
        case .unverified(_, let error):
            throw StoreBridgeError.unverified(error)
        }
    }

    private func latestTransactions(productId: String, synchronize: Bool) async throws -> [JSObject] {
        if synchronize { try await AppStore.sync() }
        var values: [JSObject] = []
        if let latest = await Transaction.latest(for: productId) {
            values.append(try transactionPayload(latest))
        }
        return values
    }

    @objc func getProducts(_ call: CAPPluginCall) {
        Task {
            do {
                let id = try productID(call)
                let products = try await Product.products(for: [id])
                guard let product = products.first(where: { $0.id == id }) else { throw StoreBridgeError.productUnavailable }
                call.resolve(["products": [productPayload(product)]])
            } catch { reject(call, error) }
        }
    }

    @objc func getSubscriptionStatus(_ call: CAPPluginCall) {
        Task {
            do { call.resolve(["transactions": try await latestTransactions(productId: productID(call), synchronize: false)]) }
            catch { reject(call, error) }
        }
    }

    @objc func startSubscription(_ call: CAPPluginCall) {
        Task {
            do {
                let id = try productID(call)
                guard let tokenString = call.getString("appAccountToken"), let token = UUID(uuidString: tokenString) else {
                    throw StoreBridgeError.invalidAccountToken
                }
                guard let product = try await Product.products(for: [id]).first(where: { $0.id == id }) else {
                    throw StoreBridgeError.productUnavailable
                }
                switch try await product.purchase(options: [.appAccountToken(token)]) {
                case .success(let verification):
                    let payload = try transactionPayload(verification)
                    if case .verified(let transaction) = verification { await transaction.finish() }
                    call.resolve(["pending": false, "transactions": [payload]])
                case .pending:
                    call.resolve(["pending": true, "transactions": []])
                case .userCancelled:
                    call.reject("Köpet avbröts.", "PURCHASE_CANCELLED")
                @unknown default:
                    call.reject("Apple returnerade ett okänt köpresultat.", "STOREKIT_UNKNOWN_RESULT")
                }
            } catch { reject(call, error) }
        }
    }

    @objc func restorePurchases(_ call: CAPPluginCall) {
        Task {
            do { call.resolve(["transactions": try await latestTransactions(productId: productID(call), synchronize: true)]) }
            catch { reject(call, error) }
        }
    }

    @objc func syncPurchases(_ call: CAPPluginCall) {
        Task {
            do { call.resolve(["transactions": try await latestTransactions(productId: productID(call), synchronize: false)]) }
            catch { reject(call, error) }
        }
    }

    @objc func openManageSubscription(_ call: CAPPluginCall) {
        Task { @MainActor in
            do {
                guard let scene = UIApplication.shared.connectedScenes.compactMap({ $0 as? UIWindowScene }).first else {
                    throw StoreBridgeError.missingWindow
                }
                try await AppStore.showManageSubscriptions(in: scene)
                call.resolve()
            } catch { reject(call, error) }
        }
    }

    private func reject(_ call: CAPPluginCall, _ error: Error) {
        switch error {
        case StoreBridgeError.missingProductID: call.reject("Premiumprodukten saknar produkt-ID.", "PRODUCT_ID_MISSING")
        case StoreBridgeError.productUnavailable: call.reject("Premiumprodukten finns inte i App Store.", "PRODUCT_UNAVAILABLE")
        case StoreBridgeError.invalidAccountToken: call.reject("Köpet saknar en säker kontokoppling.", "ACCOUNT_TOKEN_INVALID")
        case StoreBridgeError.missingWindow: call.reject("Apples prenumerationshantering kunde inte öppnas.", "MANAGE_UNAVAILABLE")
        case StoreBridgeError.unverified: call.reject("Apple kunde inte verifiera transaktionen.", "TRANSACTION_UNVERIFIED")
        default: call.reject("App Store kunde inte slutföra åtgärden. Försök igen.", "STOREKIT_ERROR", error)
        }
    }
}

private enum StoreBridgeError: Error {
    case missingProductID
    case productUnavailable
    case invalidAccountToken
    case missingWindow
    case unverified(Error)
}
