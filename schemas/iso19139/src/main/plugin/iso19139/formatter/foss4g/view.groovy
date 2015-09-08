handlers.start {
    '''<link rel="stylesheet" href="../../static/formatter.css"/>
      <div class="container">'''
}
handlers.end {
    '</div>'
}

handlers.add select: {el -> !el.'gco:CharacterString'.text().isEmpty()},
        group: true, {els ->
    def elements = els.collect {el ->
        [name: f.nodeLabel(el), text: el.text()]
    }
    handlers.fileResult('foss4g/elem.html',
            [elements: elements, parent: f.nodeLabel(els[0].parent())])
}