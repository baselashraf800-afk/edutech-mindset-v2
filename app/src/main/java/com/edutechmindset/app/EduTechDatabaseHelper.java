package com.edutechmindset.app;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import java.util.ArrayList;
import java.util.List;

public class EduTechDatabaseHelper extends SQLiteOpenHelper {

    private static final String DB_NAME = "edutech_mindset_v3.db";
    private static final int DB_VERSION = 1;

    public static class SavedFileItem {
        public long id;
        public String title;
        public String path;
        public String category; // PDF, Word, Audio, Images, Other
        public String mimeType;
        public long createdAt;
    }

    public EduTechDatabaseHelper(Context context) {
        super(context, DB_NAME, null, DB_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE IF NOT EXISTS saved_files (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "title TEXT NOT NULL," +
                "path TEXT NOT NULL," +
                "category TEXT NOT NULL," +
                "mime_type TEXT," +
                "created_at INTEGER NOT NULL)");

        db.execSQL("CREATE TABLE IF NOT EXISTS whiteboard_sessions (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "title TEXT NOT NULL," +
                "pdf_path TEXT," +
                "pages_count INTEGER DEFAULT 1," +
                "created_at INTEGER NOT NULL)");

        db.execSQL("CREATE TABLE IF NOT EXISTS reading_progress (" +
                "book_id TEXT PRIMARY KEY," +
                "title TEXT NOT NULL," +
                "last_page INTEGER DEFAULT 0," +
                "updated_at INTEGER NOT NULL)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        onCreate(db);
    }

    public long insertSavedFile(String title, String path, String category, String mimeType) {
        try {
            SQLiteDatabase db = getWritableDatabase();
            ContentValues cv = new ContentValues();
            cv.put("title", title != null ? title : "ملف محفوظ");
            cv.put("path", path != null ? path : "");
            cv.put("category", category != null ? category : "PDF");
            cv.put("mime_type", mimeType != null ? mimeType : "application/octet-stream");
            cv.put("created_at", System.currentTimeMillis());
            return db.insert("saved_files", null, cv);
        } catch (Exception e) {
            return -1;
        }
    }

    public List<SavedFileItem> getSavedFiles(String categoryFilter) {
        List<SavedFileItem> list = new ArrayList<>();
        try {
            SQLiteDatabase db = getReadableDatabase();
            Cursor c;
            if (categoryFilter == null || categoryFilter.isEmpty()) {
                c = db.query("saved_files", null, null, null, null, null, "created_at DESC", "200");
            } else {
                c = db.query("saved_files", null, "category = ?", new String[]{categoryFilter}, null, null, "created_at DESC", "200");
            }
            if (c != null) {
                while (c.moveToNext()) {
                    SavedFileItem item = new SavedFileItem();
                    item.id = c.getLong(c.getColumnIndexOrThrow("id"));
                    item.title = c.getString(c.getColumnIndexOrThrow("title"));
                    item.path = c.getString(c.getColumnIndexOrThrow("path"));
                    item.category = c.getString(c.getColumnIndexOrThrow("category"));
                    item.mimeType = c.getString(c.getColumnIndexOrThrow("mime_type"));
                    item.createdAt = c.getLong(c.getColumnIndexOrThrow("created_at"));
                    list.add(item);
                }
                c.close();
            }
        } catch (Exception ignored) {
        }
        return list;
    }

    public void recordWhiteboardSession(String title, String pdfPath, int pagesCount) {
        try {
            SQLiteDatabase db = getWritableDatabase();
            ContentValues cv = new ContentValues();
            cv.put("title", title);
            cv.put("pdf_path", pdfPath);
            cv.put("pages_count", pagesCount);
            cv.put("created_at", System.currentTimeMillis());
            db.insert("whiteboard_sessions", null, cv);
        } catch (Exception ignored) {
        }
    }

    public void saveReadingProgress(String bookId, String title, int page) {
        try {
            SQLiteDatabase db = getWritableDatabase();
            ContentValues cv = new ContentValues();
            cv.put("book_id", bookId);
            cv.put("title", title);
            cv.put("last_page", page);
            cv.put("updated_at", System.currentTimeMillis());
            db.insertWithOnConflict("reading_progress", null, cv, SQLiteDatabase.CONFLICT_REPLACE);
        } catch (Exception ignored) {
        }
    }
}
