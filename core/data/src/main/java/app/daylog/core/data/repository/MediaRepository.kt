package app.daylog.core.data.repository

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import app.daylog.core.data.local.MediaDao
import app.daylog.core.data.local.MediaEntity
import app.daylog.core.model.Media
import app.daylog.core.model.MediaType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

/**
 * The photos of an entry.
 *
 * The photos are copied into the app's own storage rather than referenced where they were picked
 * from, so the entry keeps its photos even if the original is deleted from the gallery. The
 * system photo picker is used to choose them, so no permission prompt is needed.
 */
class MediaRepository(
    private val context: Context,
    private val mediaDao: MediaDao,
    private val now: () -> Long = System::currentTimeMillis,
) {

    /** The photos of an entry, in the order they were added. */
    fun observeMedia(entryUid: String): Flow<List<Media>> =
        mediaDao.observeForEntry(entryUid).map { entities -> entities.map { it.toMedia() } }

    /**
     * Copies a photo into the app and attaches it to an entry.
     *
     * @return the uid of the new media row.
     */
    suspend fun addMedia(entryUid: String, uri: Uri): String = withContext(Dispatchers.IO) {
        val uid = UUID.randomUUID().toString()
        val directory = File(context.filesDir, "media/$entryUid")
        directory.mkdirs()

        val file = File(directory, "$uid.jpg")
        val thumbnail = File(directory, "${uid}_thumb.jpg")

        context.contentResolver.openInputStream(uri)?.use { input ->
            file.outputStream().use { output -> input.copyTo(output) }
        } ?: throw IllegalStateException("Could not read the photo.")

        generateThumbnail(file, thumbnail)

        mediaDao.insert(
            MediaEntity(
                uid = uid,
                entryUid = entryUid,
                type = MediaType.Image.name,
                path = file.absolutePath,
                thumbnailPath = thumbnail.absolutePath,
                createdAt = now(),
            ),
        )

        uid
    }

    /**
     * Removes a photo and deletes its files.
     */
    suspend fun removeMedia(uid: String) = withContext(Dispatchers.IO) {
        val row = mediaDao.findByUid(uid) ?: return@withContext
        runCatching { File(row.path).delete() }
        row.thumbnailPath?.let { runCatching { File(it).delete() } }
        mediaDao.deleteByUid(uid)
    }

    /**
     * Removes every photo of an entry. Used when an entry is deleted.
     */
    suspend fun removeMediaForEntry(entryUid: String) = withContext(Dispatchers.IO) {
        mediaDao.observeForEntry(entryUid).collect { rows ->
            // Collecting here is just to read the current rows; the delete below is by entry.
        }
        mediaDao.deleteForEntry(entryUid)
        File(context.filesDir, "media/$entryUid").deleteRecursively()
    }

    /**
     * A thumbnail at a size that is cheap to show in a list.
     */
    private fun generateThumbnail(source: File, destination: File) {
        val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeFile(source.absolutePath, options)

        val target = 256
        val scale = maxOf(
            1,
            options.outWidth / target,
            options.outHeight / target,
        )

        val decode = BitmapFactory.Options().apply { inSampleSize = scale }
        val bitmap = BitmapFactory.decodeFile(source.absolutePath, decode) ?: return

        val square = centerSquare(bitmap)
        FileOutputStream(destination).use { stream ->
            square.compress(Bitmap.CompressFormat.JPEG, 80, stream)
        }
        if (square !== bitmap) bitmap.recycle()
        square.recycle()
    }

    /**
     * A square cut from the centre, so the list has something to show.
     */
    private fun centerSquare(bitmap: Bitmap): Bitmap {
        val size = minOf(bitmap.width, bitmap.height)
        val x = (bitmap.width - size) / 2
        val y = (bitmap.height - size) / 2

        return if (x == 0 && y == 0 && size == bitmap.width && size == bitmap.height) {
            bitmap
        } else {
            Bitmap.createBitmap(bitmap, x, y, size, size)
        }
    }
}

private fun MediaEntity.toMedia(): Media = Media(
    uid = uid,
    entryUid = entryUid,
    type = runCatching { MediaType.valueOf(type) }.getOrDefault(MediaType.Image),
    path = path,
    thumbnailPath = thumbnailPath,
    createdAt = createdAt,
)
