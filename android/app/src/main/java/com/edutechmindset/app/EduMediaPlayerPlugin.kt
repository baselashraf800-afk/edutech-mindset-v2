package com.edutechmindset.app

import android.content.Intent
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "EduMediaPlayer")
class EduMediaPlayerPlugin : Plugin() {
    @PluginMethod
    fun play(call: PluginCall) {
        val uri = call.getString("uri") ?: return call.reject("Missing media URI")
        val title = call.getString("title") ?: "EduTech Media3 Player"
        val intent = Intent(context, EduMediaPlayerActivity::class.java).apply {
            putExtra("uri", uri)
            putExtra("title", title)
        }
        activity.startActivity(intent)
        call.resolve(JSObject().put("ok", true))
    }
}
