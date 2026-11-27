package com.edutechmindset.app

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

data class SavedFileRecord(
    val id: Long,
    val title: String,
    val path: String,
    val category: String,
    val mimeType: String,
    val sizeBytes: Long,
    val createdAt: Long
)

data class BookProgressRecord(
    val path: String,
    val title: String,
    val currentPage: Int,
    val totalPages: Int,
    val updatedAt: Long
)

class EduTechDatabaseHelper(context: Context) :
    SQLiteOpenHelper(context, "edutech_v310_local.db", null, 1) {

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            """CREATE TABLE IF NOT EXISTS saved_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                path TEXT UNIQUE NOT NULL,
                category TEXT NOT NULL,
                mime_type TEXT NOT NULL,
                size_bytes INTEGER DEFAULT 0,
                created_at INTEGER NOT NULL
            )"""
        )
        db.execSQL(
            """CREATE TABLE IF NOT EXISTS book_progress (
                path TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                current_page INTEGER DEFAULT 0,
                total_pages INTEGER DEFAULT 1,
                bookmarks TEXT DEFAULT '',
                updated_at INTEGER NOT NULL
            )"""
        )
        db.execSQL(
            """CREATE TABLE IF NOT EXISTS kv_store (
                k TEXT PRIMARY KEY,
                v TEXT,
                updated_at INTEGER NOT NULL
            )"""
        )
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {}

    fun recordSavedFile(title: String, path: String, category: String, mimeType: String, sizeBytes: Long) {
        val cv = ContentValues().apply {
            put("title", title)
            put("path", path)
            put("category", category)
            put("mime_type", mimeType)
            put("size_bytes", sizeBytes)
            put("created_at", System.currentTimeMillis())
        }
        writableDatabase.insertWithOnConflict("saved_files", null, cv, SQLiteDatabase.CONFLICT_REPLACE)
    }

    fun listSavedFiles(category: String? = null): List<SavedFileRecord> {
        val list = mutableListOf<SavedFileRecord>()
        val sql = if (category.isNullOrBlank() || category == "ALL") {
            "SELECT id, title, path, category, mime_type, size_bytes, created_at FROM saved_files ORDER BY created_at DESC LIMIT 200"
        } else {
            "SELECT id, title, path, category, mime_type, size_bytes, created_at FROM saved_files WHERE category = ? ORDER BY created_at DESC LIMIT 200"
        }
        val args = if (category.isNullOrBlank() || category == "ALL") null else arrayOf(category)
        readableDatabase.rawQuery(sql, args).use { c ->
            while (c.moveToNext()) {
                list.add(
                    SavedFileRecord(
                        id = c.getLong(0),
                        title = c.getString(1),
                        path = c.getString(2),
                        category = c.getString(3),
                        mimeType = c.getString(4),
                        sizeBytes = c.getLong(5),
                        createdAt = c.getLong(6)
                    )
                )
            }
        }
        return list
    }

    fun deleteSavedFileRecord(path: String) {
        writableDatabase.delete("saved_files", "path = ?", arrayOf(path))
    }

    fun saveBookProgress(path: String, title: String, currentPage: Int, totalPages: Int) {
        val cv = ContentValues().apply {
            put("path", path)
            put("title", title)
            put("current_page", currentPage)
            put("total_pages", if (totalPages > 0) totalPages else 1)
            put("updated_at", System.currentTimeMillis())
        }
        writableDatabase.insertWithOnConflict("book_progress", null, cv, SQLiteDatabase.CONFLICT_REPLACE)
    }

    fun getBookProgress(path: String): BookProgressRecord? {
        readableDatabase.rawQuery(
            "SELECT path, title, current_page, total_pages, updated_at FROM book_progress WHERE path = ?",
            arrayOf(path)
        ).use { c ->
            if (c.moveToFirst()) {
                return BookProgressRecord(c.getString(0), c.getString(1), c.getInt(2), c.getInt(3), c.getLong(4))
            }
        }
        return null
    }

    fun getAllBookProgress(): Map<String, BookProgressRecord> {
        val map = mutableMapOf<String, BookProgressRecord>()
        readableDatabase.rawQuery(
            "SELECT path, title, current_page, total_pages, updated_at FROM book_progress ORDER BY updated_at DESC",
            null
        ).use { c ->
            while (c.moveToNext()) {
                val rec = BookProgressRecord(c.getString(0), c.getString(1), c.getInt(2), c.getInt(3), c.getLong(4))
                map[rec.path] = rec
            }
        }
        return map
    }
}
