handlers.start {
    '''<div class="gn-metadata-view container">'''
}
handlers.end {
    '</div>'
}

def isoHandlers = new iso19139.Handlers(handlers, f, env)

handlers.add select: isoHandlers.matchers.isTextEl, isoHandlers.isoTextEl
handlers.add name: 'Container Elements',
        select: isoHandlers.matchers.isContainerEl,
        priority: -1,
        isoHandlers.commonHandlers.entryEl(f.&nodeLabel,
                isoHandlers.addPackageViewClass)
isoHandlers.addExtentHandlers()
