handlers.add select: {el -> !el.'gco:CharacterString'.text().isEmpty()}, {el ->
    handlers.fileResult('demo/elem.html', [name: el.name(), text: el.text()])
}

