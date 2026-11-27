package com.edutechmindset.app

import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.io.File

@CapacitorPlugin(name = "EduPdfReader")
class EduPdfReaderPlugin : Plugin() {
    @PluginMethod
    fun openPdf(call: PluginCall) {
        val uriStr = call.getString("uri") ?: return call.reject("Missing PDF URI")
        try {
            val contentUri: Uri = if (uriStr.startsWith("/")) {
                FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", File(uriStr))
            } else {
                Uri.parse(uriStr)
            }
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(contentUri, "application/pdf")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            activity.startActivity(Intent.createChooser(intent, "فتح ملف PDF"))
            call.resolve(JSObject().put("ok", true))
        } catch (e: Exception) {
            call.reject("Cannot open PDF: ${e.message}")
        }
    }
}
