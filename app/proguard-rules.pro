# Keep line numbers for readable crash reports.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# kotlinx.serialization.
#
# The library ships rules of its own, so this is belt and braces. The app's own classes are named
# here anyway: the exported file is a promise about the writing, and it should not depend on a
# rule that lives in somebody else's jar.
#
# Room finds its generated database class by name, and keeps it itself. Navigation, Compose, Coil
# and DataStore all ship the rules they need, so there is nothing to add for them.
-keepattributes *Annotation*, InnerClasses

-if @kotlinx.serialization.Serializable class app.daylog.**
-keepclassmembers class <1> {
    static <1>$Companion Companion;
}

-if @kotlinx.serialization.Serializable class app.daylog.** {
    static **$* *;
}
-keepclassmembers class <2>$<3> {
    kotlinx.serialization.KSerializer serializer(...);
}

-keepclasseswithmembers class app.daylog.** {
    kotlinx.serialization.KSerializer serializer(...);
}

-keep,includedescriptorclasses class app.daylog.**$$serializer { *; }
