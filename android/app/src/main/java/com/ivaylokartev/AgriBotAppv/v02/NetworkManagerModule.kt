package com.ivaylokartev.AgriBotAppv.v02

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log

class NetworkManagerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var boundNetwork: Network? = null

    override fun getName(): String {
        return "NetworkManager"
    }

    @ReactMethod
    fun bindToWiFi(ssid: String, promise: Promise) {
        try {
            val connectivityManager = reactApplicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val wifiManager = reactApplicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager

            // Find the network with the desired SSID
            for (network in connectivityManager.allNetworks) {
                val info = wifiManager.connectionInfo
                if (info.ssid == "\"$ssid\"") {
                    connectivityManager.bindProcessToNetwork(network)
                    boundNetwork = network
                    promise.resolve("Bound to WiFi network: $ssid")
                    return
                }
            }
            promise.reject("NetworkError", "Failed to bind to the specified WiFi network.")
        } catch (e: Exception) {
            promise.reject("Exception", e.message)
        }
    }

    @ReactMethod
    fun bindToMobileData() {
        try {
            Log.d("NetworkManagerModule", "ConnectivityManager returrn attempt ");

            val connectivityManager = reactApplicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            Log.d("NetworkManagerModule", "ConnectivityManager returned successfully ");

            // Find a network with mobile data capability
            for (network in connectivityManager.allNetworks) {
                val capabilities = connectivityManager.getNetworkCapabilities(network)
                if (capabilities != null && capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) {
                    val success = connectivityManager.bindProcessToNetwork(network)
                    if (success) {
                        //promise.resolve("Successfully bound to mobile data network.")
                        Log.d("NetworkManagerModule", "Binding successfull!");

                    } else {
                        //promise.reject("BindingError", "Failed to bind to mobile data network.")
                        Log.d("NetworkManagerModule", "Binding error!");
                    }
                    //return
                }
            }
            //promise.reject("NetworkError", "No mobile data network available.")
        } catch (e: Exception) {
            //promise.reject("Exception", e.message)
            Log.d("NetworkManagerModule", "This error: " + e.message)
        }
    }

    @ReactMethod
    fun testPackage() {
        Log.d("NetworkManagerModule", "Module accessible")
    }

    @ReactMethod
    fun unbindNetwork(promise: Promise) {
        try {
            val connectivityManager = reactApplicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            connectivityManager.bindProcessToNetwork(null) // Unbind
            boundNetwork = null
            promise.resolve("Unbound from any network")
        } catch (e: Exception) {
            promise.reject("Exception", e.message)
        }
    }
}
