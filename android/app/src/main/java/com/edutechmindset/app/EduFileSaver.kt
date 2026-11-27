package com.edutechmindset.app

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream

data class SaveResult(
    val ok: Boolean,
    val displayName: String,
    val filePath: String,
    val contentUri: Uri?,
    val category: String,
    val mimeType: String,
    val error: String? = null
)

object EduFileSaver {
    fun detectSubfolder(fileName: String, mimeType: String): String {
        val lower = fileName.lowercase()
        return when {
            lower.endsWith(".pdf") || mimeType.contains("pdf") -> "PDF"
            lower.endsWith(".doc") || lower.endsWith(".docx") || mimeType.contains("word") -> "Word"
            lower.endsWith(".mp3") || lower.endsWith(".wav") || lower.endsWith(".m4a") || mimeType.startsWith("audio/") -> "Audio"
            lower.endsWith(".mp4") || lower.endsWith(".webm") || mimeType.startsWith("video/") -> "Video"
            lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || mimeType.startsWith("image/") -> "Images"
            else -> "PDF"
        }
    }

    fun saveBytes(context: Context, bytes: ByteArray, rawFileName: String, mimeType: String): SaveResult {
        val safeName = rawFileName.replace(Regex("[^\\u0600-\\u06FFa-zA-Z0-9._\\- ]"), "_").ifBlank {
            "EduTech_${System.currentTimeMillis()}.pdf"
        }
        val sub = detectSubfolder(safeName, mimeType)
        return try {
            // Also keep a readable copy in app-accessible Downloads/EduTech_Mindset/<sub/>
            val appSubDir = File(context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "EduTech_Mindset/$sub")
            if (!appSubDir.exists()) appSubDir.mkdirs()
            val localFile = File(appSubDir, safeName)
            FileOutputStream(localFile).use { it.write(bytes) }

            var savedUri: Uri? = null
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val values = ContentValues().apply {
                    put(MediaStore.Downloads.DISPLAY_NAME, safeName)
                    put(MediaStore.Downloads.MIME_TYPE, mimeType)
                    put(MediaStore.Downloads.RELATIVE_PATH, "${Environment.DIRECTORY_DOWNLOADS}/EduTech_Mindset/$sub")
                    put(MediaStore.Downloads.IS_PENDING, 1)
                }
                val resolver = context.contentResolver
                val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                if (uri != null) {
                    resolver.openOutputStream(uri)?.use { it.write(bytes) }
                    values.clear()
                    values.put(MediaStore.Downloads.IS_PENDING, 0)
                    resolver.update(uri, values, null, null)
                    savedUri = uri
                }
            } else {
                @Suppress("DEPRECATION")
                val pubDir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "EduTech_Mindset/$sub")
                if (!pubDir.exists()) pubDir.mkdirs()
                val pubFile = File(pubDir, safeName)
                FileOutputStream(pubFile).use { it.write(bytes) }
                savedUri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", pubFile)
            }

            if (savedUri == null) {
                savedUri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", localFile)
            }

            EduTechDatabaseHelper(context).recordSavedFile(
                title = safeName,
                path = localFile.absolutePath,
                category = sub,
                mimeType = mimeType,
                sizeBytes = bytes.size.toLong()
            )
            SaveResult(true, safeName, localFile.absolutePath, savedUri, sub, mimeType)
        } catch (e: Exception) {
            SaveResult(false, safeName, "", null, sub, mimeType, e.message)
        }
    }

    fun saveBase64(context: Context, base64Data: String, fileName: String, mimeType: String): SaveResult {
        return try {
            val clean = base64Data.substringAfter(",", base64Data)
            val bytes = Base64.decode(clean, Base64.DEFAULT)
            saveBytes(context, bytes, fileName, mimeType)
        } catch (e: Exception) {
            SaveResult(false, fileName, "", null, "PDF", mimeType, e.message)
        }
    }

    fun shareFile(context: Context, filePath: String, mimeType: String) {
        try {
            val file = File(filePath)
            val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = mimeType
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            val chooser = Intent.createChooser(intent, "مشاركة الملف عبر واتساب / تيليجرام")
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(chooser)
        } catch (_: Exception) {}
    }

    fun openFile(context: Context, filePath: String, mimeType: String) {
        try {
            if (mimeType.contains("pdf") || filePath.lowercase().endsWith(".pdf")) {
                val i = Intent(context, MoonBookReaderActivity::class.java).apply {
                    putExtra("PDF_PATH", filePath)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(i)
                return
            }
            if (mimeType.startsWith("video/") || mimeType.startsWith("audio/")) {
                val i = Intent(context, EduMediaPlayerActivity::class.java).apply {
                    putExtra("MEDIA_URL", Uri.fromFile(File(filePath)).toString())
                    putExtra("MEDIA_TITLE", File(filePath).name)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(i)
                return
            }
            val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", File(filePath))
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, mimeType)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(Intent.createChooser(intent, "فتح الملف").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        } catch (_: Exception) {}
    }
}
