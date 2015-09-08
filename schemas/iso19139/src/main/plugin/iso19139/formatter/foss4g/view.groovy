handlers.start {
    '''<link rel="stylesheet" href="../../static/formatter.css"/>
      <div class="container">'''
}
handlers.end {
    '</div>'
}

handlers.add select: {el -> !el.'gco:CharacterString'.text().isEmpty()}, {el ->
    handlers.fileResult('foss4g/elem.html', [name: el.name(), text: el.text()])
}

