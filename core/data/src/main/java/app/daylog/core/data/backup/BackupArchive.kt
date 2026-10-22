package app.daylog.core.data.backup

import java.io.File
import java.io.InputStream
import java.io.OutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream

/**
 * The file an export writes and an import reads.
 *
 * The file is a small archive holding the JSON of the entries and the photos themselves. Plain
 * JSON would have to leave the photos behind, and a backup that quietly drops the photos is not a
 * backup.
 *
 * A plain JSON file is still read on an import, because that is what a hand-written or an older
 * file looks like. It brings the writing across; it cannot bring the photos.
 */
object BackupArchive {

    /** The name of the JSON inside the archive. */
    const val DATA_NAME = "daylog.json"

    private const val PHOTO_FOLDER = "photos"

    /**
     * A photo that has been unpacked onto the device.
     */
    data class Photo(
        val uid: String,
        val entryUid: String,
        val file: File,
        val thumbnail: File?,
    )

    /**
     * What an archive holds.
     */
    data class Archive(
        val json: String,
        val photos: List<Photo> = emptyList(),
    )

    /**
     * Writes the archive.
     *
     * @param photos the photos to put in it. A photo whose file has gone missing is left out
     * rather than written as an empty entry.
     */
    fun write(output: OutputStream, json: String, photos: List<Photo>) {
        ZipOutputStream(output).use { zip ->
            zip.putNextEntry(ZipEntry(DATA_NAME))
            zip.write(json.toByteArray(Charsets.UTF_8))
            zip.closeEntry()

            photos.forEach { photo ->
                photo.file.takeIf { it.exists() }?.let { file ->
                    zip.putNextEntry(ZipEntry("$PHOTO_FOLDER/${photo.entryUid}/${photo.uid}.jpg"))
                    file.inputStream().use { it.copyTo(zip) }
                    zip.closeEntry()
                }
                photo.thumbnail?.takeIf { it.exists() }?.let { file ->
                    zip.putNextEntry(
                        ZipEntry("$PHOTO_FOLDER/${photo.entryUid}/${photo.uid}_thumb.jpg"),
                    )
                    file.inputStream().use { it.copyTo(zip) }
                    zip.closeEntry()
                }
            }
        }
    }

    /**
     * Reads the archive.
     *
     * The file is put on disk first and read from there, so a diary with a lot of photos in it
     * never has to be held in memory all at once.
     *
     * @param mediaDirectory where the photos are unpacked to.
     * @param cacheDirectory where the file is copied to before it is read.
     * @return what the file holds, or null when it is not something this app can read.
     */
    fun read(
        input: InputStream,
        mediaDirectory: File,
        cacheDirectory: File,
    ): Archive? {
        val temporary = File(cacheDirectory, "daylog-import.tmp")
        input.use { stream -> temporary.outputStream().use { stream.copyTo(it) } }

        return try {
            val isArchive = temporary.inputStream().use { stream ->
                val head = ByteArray(2)
                stream.read(head) == 2 &&
                    head[0] == 'P'.code.toByte() &&
                    head[1] == 'K'.code.toByte()
            }
            if (isArchive) readArchive(temporary, mediaDirectory) else readJson(temporary)
        } finally {
            temporary.delete()
        }
    }

    /**
     * Reads an archive written by [write].
     */
    private fun readArchive(file: File, mediaDirectory: File): Archive? {
        var json: String? = null
        val unpacked = mutableMapOf<String, Pair<File?, File?>>()

        ZipInputStream(file.inputStream()).use { zip ->
            var entry: ZipEntry? = zip.nextEntry
            while (entry != null) {
                val name = entry.name
                when {
                    name == DATA_NAME -> json = zip.readBytes().toString(Charsets.UTF_8)

                    name.startsWith("$PHOTO_FOLDER/") && name.endsWith(".jpg") -> {
                        val parts = name.removePrefix("$PHOTO_FOLDER/").split("/")
                        if (parts.size == 2) {
                            val entryUid = parts[0]
                            val fileName = parts[1]
                            val isThumbnail = fileName.endsWith("_thumb.jpg")
                            val uid = fileName.removeSuffix("_thumb.jpg").removeSuffix(".jpg")

                            val directory = File(mediaDirectory, entryUid).apply { mkdirs() }
                            val target = File(directory, fileName)
                            target.outputStream().use { zip.copyTo(it) }

                            val key = "$entryUid/$uid"
                            val (picture, thumbnail) = unpacked[key] ?: (null to null)
                            unpacked[key] = if (isThumbnail) {
                                picture to target
                            } else {
                                target to thumbnail
                            }
                        }
                    }
                }
                zip.closeEntry()
                entry = zip.nextEntry
            }
        }

        val text = json ?: return null

        val photos = unpacked.mapNotNull { (key, files) ->
            val (picture, thumbnail) = files
            // A photo without its picture is no use, so a thumbnail on its own is left out.
            val file = picture ?: return@mapNotNull null
            BackupArchive.Photo(
                uid = key.substringAfter("/"),
                entryUid = key.substringBefore("/"),
                file = file,
                thumbnail = thumbnail,
            )
        }

        return Archive(json = text, photos = photos)
    }

    /**
     * Reads a plain JSON file.
     */
    private fun readJson(file: File): Archive? {
        val text = file.readText()
        if (text.isBlank()) return null
        return Archive(json = text, photos = emptyList())
    }
}
