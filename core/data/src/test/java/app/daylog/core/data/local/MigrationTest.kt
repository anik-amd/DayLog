package app.daylog.core.data.local

import android.content.Context
import androidx.room.Room
import androidx.sqlite.db.SupportSQLiteDatabase
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config
import java.io.File

/**
 * The upgrade from the first version of the database.
 *
 * A person who has been keeping a diary in the app has the version 1 database on their phone.
 * When the app is updated, the database is upgraded in place, and the entries they already had
 * have to still be there afterwards — including their search index, which is built from them.
 *
 * The version 1 database is written by hand here, from the schema that was exported when
 * version 1 was current, so the test really does start from the old shape.
 */
@RunWith(AndroidJUnit4::class)
@Config(sdk = [34])
class MigrationTest {

    private lateinit var context: Context
    private lateinit var databaseFile: File

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        databaseFile = File(context.getDatabasePath(DATABASE_NAME).absolutePath)
        databaseFile.parentFile?.mkdirs()
        databaseFile.delete()
    }

    @After
    fun tearDown() {
        databaseFile.delete()
    }

    @Test
    fun `the entries survive the upgrade and can be searched`() = runTest {
        writeVersionOneDatabase()

        val database = Room.databaseBuilder(context, DayLogDatabase::class.java, DATABASE_NAME)
            .addMigrations(*DayLogMigrations.ALL)
            .build()

        try {
            val entries = database.entryDao().observeEntries().first()
            assertEquals(2, entries.size)
            assertEquals("an older thought", entries.first { it.uid == "old" }.content)

            // The index is built from the entries that were already there, so the whole diary can
            // be searched straight away rather than only what is written after the upgrade.
            val found = database.entryFtsDao().search("older*")
            assertEquals(listOf("old"), found)
        } finally {
            database.close()
        }
    }

    @Test
    fun `the upgrade leaves the tables the app needs`() = runTest {
        writeVersionOneDatabase()

        val database = Room.databaseBuilder(context, DayLogDatabase::class.java, DATABASE_NAME)
            .addMigrations(*DayLogMigrations.ALL)
            .build()

        try {
            val tables = mutableSetOf<String>()
            database.query("SELECT name FROM sqlite_master WHERE type = 'table'", emptyArray())
                .use { cursor ->
                    while (cursor.moveToNext()) tables += cursor.getString(0)
                }

            assertTrue(tables.contains("entries"))
            assertTrue(tables.contains("entries_fts"))
        } finally {
            database.close()
        }
    }

    /**
     * Writes a database in the shape version 1 had.
     */
    private fun writeVersionOneDatabase() {
        val db = android.database.sqlite.SQLiteDatabase.openOrCreateDatabase(databaseFile, null)

        db.execSQL(
            "CREATE TABLE IF NOT EXISTS `entries` (`id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, " +
                "`uid` TEXT NOT NULL, `content` TEXT NOT NULL, `createdAt` INTEGER NOT NULL, " +
                "`updatedAt` INTEGER NOT NULL, `deletedAt` INTEGER, `placeName` TEXT, " +
                "`placeLat` REAL, `placeLon` REAL, `weatherSummary` TEXT, `weatherCode` INTEGER, " +
                "`syncedAt` INTEGER)",
        )
        db.execSQL(
            "CREATE TABLE IF NOT EXISTS `tags` (`name` TEXT NOT NULL, `count` INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(`name`))",
        )
        db.execSQL(
            "CREATE TABLE IF NOT EXISTS `entry_tags` (`entryUid` TEXT NOT NULL, `tagName` TEXT NOT NULL, " +
                "PRIMARY KEY(`entryUid`, `tagName`), FOREIGN KEY(`entryUid`) REFERENCES `entries`(`uid`) " +
                "ON UPDATE NO ACTION ON DELETE CASCADE , FOREIGN KEY(`tagName`) REFERENCES `tags`(`name`) " +
                "ON UPDATE NO ACTION ON DELETE CASCADE )",
        )
        db.execSQL(
            "CREATE TABLE IF NOT EXISTS `media` (`uid` TEXT NOT NULL, `entryUid` TEXT NOT NULL, " +
                "`type` TEXT NOT NULL, `path` TEXT NOT NULL, `thumbnailPath` TEXT, " +
                "`createdAt` INTEGER NOT NULL, PRIMARY KEY(`uid`), FOREIGN KEY(`entryUid`) " +
                "REFERENCES `entries`(`uid`) ON UPDATE NO ACTION ON DELETE CASCADE )",
        )

        db.execSQL(
            "INSERT INTO `entries` (`uid`, `content`, `createdAt`, `updatedAt`) " +
                "VALUES ('old', 'an older thought', 1000, 1000)",
        )
        db.execSQL(
            "INSERT INTO `entries` (`uid`, `content`, `createdAt`, `updatedAt`) " +
                "VALUES ('new', 'a newer thought', 2000, 2000)",
        )
        // A deleted entry is not indexed, so it cannot be found by searching for it.
        db.execSQL(
            "INSERT INTO `entries` (`uid`, `content`, `createdAt`, `updatedAt`, `deletedAt`) " +
                "VALUES ('gone', 'a deleted thought', 3000, 3000, 3000)",
        )

        db.version = 1
        db.close()
    }

    private companion object {
        const val DATABASE_NAME = "daylog.db"
    }
}
