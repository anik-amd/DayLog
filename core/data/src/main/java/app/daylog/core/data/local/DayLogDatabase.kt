package app.daylog.core.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

/**
 * The local database.
 *
 * `exportSchema` is on and the schema JSON is committed under `core/data/schemas`, so every schema
 * change is reviewable and migration tests have a baseline to compare against.
 */
@Database(
    entities = [
        EntryEntity::class,
        TagEntity::class,
        EntryTagEntity::class,
        MediaEntity::class,
        EntryFtsEntity::class,
    ],
    version = 2,
    exportSchema = true,
)
abstract class DayLogDatabase : RoomDatabase() {

    abstract fun entryDao(): EntryDao
    abstract fun tagDao(): TagDao
    abstract fun mediaDao(): MediaDao
    abstract fun entryFtsDao(): EntryFtsDao

    companion object {
        private const val DATABASE_NAME = "daylog.db"

        fun create(context: Context): DayLogDatabase =
            Room.databaseBuilder(context, DayLogDatabase::class.java, DATABASE_NAME)
                .addMigrations(*DayLogMigrations.ALL)
                .build()

        fun createInMemory(context: Context): DayLogDatabase =
            Room.inMemoryDatabaseBuilder(context, DayLogDatabase::class.java)
                .allowMainThreadQueries()
                .build()
    }
}
