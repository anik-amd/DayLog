package app.daylog.core.data.local

import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

/**
 * The database migrations.
 *
 * Every one of these has to be written as though the reader already has the data: the people
 * upgrading are the ones with the diary they have been keeping. A migration that loses an entry
 * is not a bug, it is the end of someone's record.
 */
object DayLogMigrations {

    /**
     * 1 → 2: the search index.
     *
     * The index is built from the entries that are already there, so a person who upgrades can
     * search their whole diary straight away rather than only the entries written afterwards.
     */
    val MIGRATION_1_2 = object : Migration(1, 2) {
        override fun migrate(db: SupportSQLiteDatabase) {
            db.execSQL(
                """
                CREATE VIRTUAL TABLE IF NOT EXISTS `entries_fts`
                USING FTS4(`rowid`, `uid`, `content`, `tags`, tokenize=unicode61)
                """.trimIndent(),
            )

            db.execSQL(
                """
                INSERT INTO `entries_fts` (`rowid`, `uid`, `content`, `tags`)
                SELECT `id`, `uid`, `content`, ''
                FROM `entries`
                WHERE `deletedAt` IS NULL
                """.trimIndent(),
            )
        }
    }

    /**
     * Every migration, in order.
     */
    val ALL: Array<Migration> = arrayOf(MIGRATION_1_2)
}
