handlers.add select: {el -> !el.'gco:CharacterString'.text().isEmpty()}, {el ->
    "<div><b>${el.name()}</b> - ${el.text()}</div>"
}
