import org.gradle.kotlin.dsl.closureOf

plugins {
    id("org.asciidoctor.jvm.convert") version "4.0.2"
}

repositories {
    mavenCentral()
}

asciidoctorj {
    modules {
        diagram(
            closureOf<Any> {
                // use default diagram module version bundled with plugin
            },
        )
    }
}

// Configure AsciiDoc for all documentation modules
val docModules = listOf("denovm", "flow", "jwt")

docModules.forEach { module ->
    tasks.register<org.asciidoctor.gradle.jvm.AsciidoctorTask>("asciidoctor${module.replaceFirstChar { it.uppercase() }}") {
        baseDirFollowsSourceDir()
        setSourceDir(file("docs/$module"))
        setOutputDir(file("build/docs/$module"))

        attributes(
            mapOf(
                "source-highlighter" to "coderay",
                "toc" to "left",
                "toclevels" to "3",
                "sectanchors" to "",
                "sectlinks" to "",
                "icons" to "font",
                "imagesdir" to "images",
            ),
        )

        sources {
            include("**/*.adoc")
        }

        resources {
            from("docs/$module/images") {
                include("**/*")
                into("images")
            }
        }

        doFirst {
            delete(file("build/docs/$module"))
        }
    }
}

// Build main index page
tasks.register<org.asciidoctor.gradle.jvm.AsciidoctorTask>("asciidoctorIndex") {
    baseDirFollowsSourceDir()
    setSourceDir(file("docs"))
    setOutputDir(file("build/docs"))

    attributes(
        mapOf(
            "source-highlighter" to "coderay",
            "toc" to "left",
            "toclevels" to "3",
            "sectanchors" to "",
            "sectlinks" to "",
            "icons" to "font",
        ),
    )

    sources {
        include("index.adoc")
    }
}

// Main build task
tasks.register("buildDocs") {
    dependsOn("asciidoctorIndex")
    docModules.forEach { module ->
        dependsOn("asciidoctor${module.replaceFirstChar { it.uppercase() }}")
    }
}

// Default build task
tasks.named("build") {
    dependsOn("buildDocs")
}

// Task to prepare GitHub Pages
tasks.register<Copy>("prepareGhPages") {
    dependsOn("buildDocs")
    from("build/docs") {
        include("**/*")
    }
    into("build/gh-pages")
}
