package com.edutechmindset.app

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.os.Environment
import android.util.Base64
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.io.File
import java.io.FileOutputStream

private class EduVaultDbHelper(ctx: Context) : SQLiteOpenHelper(ctx, "edutech_vault.db", null, 1) {
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("CREATE TABLE IF NOT EXISTS kv_store (k TEXT PRIMARY KEY, v TEXT, updated_at INTEGER)")
    }
    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {}
}

@CapacitorPlugin(name = "EduVault")
class EduVaultPlugin : Plugin() {
    private val dbHelper by lazy { EduVaultDbHelper(context) }

    @PluginMethod
    fun saveToDocuments(call: PluginCall) {
        val rawFolder = call.getString("folder") ?: "General"
        val rawFileName = call.getString("fileName") ?: "file_${System.currentTimeMillis()}.bin"
        val b64 = call.getString("base64") ?: ""
        try {
            val safeFolder = rawFolder.replace(Regex("[^\\u0600-\\u06FFa-zA-Z0-9_\\-]"), "_").trim('_').ifBlank { "General" }
            val safeFileName = rawFileName
                .substringAfterLast('/')
                .substringAfterLast('\\')
                .replace("..", "_")
                .replace(Regex("[^\\u0600-\\u06FFa-zA-Z0-9._\\- ]"), "_")
                .trim()
                .ifBlank { "file_${System.currentTimeMillis()}.bin" }
            val rootDir = File(context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS), "EduTechMindset")
            val baseDir = File(rootDir, safeFolder)
            if (!baseDir.exists()) baseDir.mkdirs()
            val outFile = File(baseDir, safeFileName)
            val rootCanonical = rootDir.canonicalPath
            val outCanonical = outFile.canonicalPath
            if (!outCanonical.startsWith(rootCanonical + File.separator)) {
                call.reject("Invalid target path")
                return
            }
            FileOutputStream(outFile).use { it.write(Base64.decode(b64, Base64.DEFAULT)) }
            val ret = JSObject()
            ret.put("ok", true)
            ret.put("path", outFile.absolutePath)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Save failed: ${e.message}")
        }
    }

    @PluginMethod
    fun kvSet(call: PluginCall) {
        val key = call.getString("key") ?: return call.reject("Missing key")
        val value = call.getString("value") ?: ""
        val cv = ContentValues().apply {
            put("k", key)
            put("v", value)
            put("updated_at", System.currentTimeMillis())
        }
        dbHelper.writableDatabase.insertWithOnConflict("kv_store", null, cv, SQLiteDatabase.CONFLICT_REPLACE)
        call.resolve(JSObject().put("ok", true))
    }

    @PluginMethod
    fun kvGet(call: PluginCall) {
        val key = call.getString("key") ?: return call.reject("Missing key")
        var result: String? = null
        dbHelper.readableDatabase.rawQuery("SELECT v FROM kv_store WHERE k = ?", arrayOf(key)).use { c ->
            if (c.moveToFirst()) result = c.getString(0)
        }
        call.resolve(JSObject().put("value", result))
    }
}
