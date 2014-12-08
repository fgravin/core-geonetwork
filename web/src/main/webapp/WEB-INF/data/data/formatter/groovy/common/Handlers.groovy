package common

import org.fao.geonet.services.metadata.format.groovy.Environment

public class Handlers {
    private org.fao.geonet.services.metadata.format.groovy.Handlers handlers;
    private org.fao.geonet.services.metadata.format.groovy.Functions f
    private Environment env

    common.Matchers matchers
    common.Functions func

    public Handlers(handlers, f, env) {
        this.handlers = handlers
        this.f = f
        this.env = env
        func = new common.Functions(handlers: handlers, f:f, env:env)
        matchers =  new common.Matchers(handlers: handlers, f:f, env:env)
    }

    def addDefaultStartAndEndHandlers() {
        handlers.start htmlOrXmlStart
        handlers.end htmlOrXmlEnd
    }

    def entryEl(labeller) {
        return entryEl(labeller, null)
    }
    /**
     * Creates a function that will process all children and sort then according to the sorter that applies to the elements. Then
     * returns the default html for the container elements.
     *
     * @param labeller a function for creating a label from the element
     * @param classer a function taking the element class(es) to add to the entry element.  The method should return a string.
     */
    def entryEl(labeller, classer) {
        return { el ->
            def childData = handlers.processElements(el.children(), el);
            def replacement = [label: labeller(el), childData: childData, name:'']

            if (classer != null) {
                replacement.name = classer(el);
            }

            if (!childData.isEmpty()) {
                return handlers.fileResult('html/2-level-entry.html', replacement)
            }
            return null
        }
    }
    def processChildren(childSelector) {
        return {el ->
            handlers.processElements(childSelector(el), el);
        }
    }
    /**
     * Creates a function which will:
     *
     * 1. Select a single element using the selector function
     * 2. Process all children of the element selected in step 1 with sorter that applies to the element selected in step 1
     * 3. Create a label using executing the labeller on the element passed to handler functions (not element selected in step 1)
     *
     * @param selector a function that will select a single element from the descendants of the element passed to it
     * @param labeller a function for creating a label from the element
     */
    def flattenedEntryEl(selector, labeller) {
        return { parentEl ->
            def el = selector(parentEl)
            def childData = handlers.processElements(el.children(), el);

            if (!childData.isEmpty()) {
                return handlers.fileResult('html/2-level-entry.html', [label: labeller(el), childData: childData])
            }
            return null
        }
    }
    /**
     * Return a function that will find the children of the element and apply the handlerFunc to the first child.  If there is not
     * exactly one child then an error will be thrown.
     */
    static def applyToChild(handlerFunc, name) {
        return {el ->
            def children = el[name]
            if (children.size() == 1) {
                return handlerFunc(children[0])
            } else {
                throw new IllegalStateException("There is supposed to be only a single child when this method is called")
            }
        }
    }

    def selectIsotype(name) {
        return {
            it.children().find { ch ->
                ch.name() == name || ch['@gco:isoType'].text() == name
            }
        }
    }

    /**
     * Returns a function that checks if the text is empty, if not then it executes the handlerFunction to process the
     * data from the element and returns that data.
     *
     * @param handlerFunc the function for processing the element.
     * @return
     */
    static def nonEmpty(handlerFunc) {
        def nonEmptyText = {!it.text().isEmpty()}
        when (nonEmptyText, handlerFunc)
    }
    /**
     * Returns a function (usable as a handler) that checks if the text is empty, if not then it executes the
     * handlerFunction to process the data from the element and returns that data.
     *
     * @param test the test to check if the handler should be ran
     * @param handlerFunc  the function for processing the element.
     * @return
     */
    static def when(test, handlerFunc) {
        return {el ->
            if (test(el)) {
                return handlerFunc(el)
            }
        }
    }

    /**
     * Creates function that creates a span containing the information obtained from the element (el) by calling the valueFunc with
     * el as the parameter
     */
    def span(valueFunc) {
        return { el ->
            f.html {
                it.span(valueFunc(el))
            }
        }
    }

    def htmlOrXmlStart = {
        if (func.isHtmlOutput()) {
            def libJs = '../../static/lib.js'
            if (env.param("debug").toBool()) {
                libJs += '?minimize=false'
            }
            return """
<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8"/>
    <link rel="stylesheet" href="../../static/metadata_formatter.css"/>
    <script src="$libJs"></script>
</head>
<body>>
"""
        } else {
            return ''
        }
    }

    def htmlOrXmlEnd = {
        if (func.isHtmlOutput()) {
            return '''
<script>
    $('.toggler').on('click', function() {
        $(this).toggleClass('closed');
        $(this).parent().nextAll('.target').first().toggle();
    });

    $('.nav-pills a[rel]').on('click', function(e) {
        $('.container > .entry').hide();
        $($(this).attr('rel')).show();
        e.preventDefault();
    });

    $
</script>
</body>
</html>'''
        } else {
            return ''
        }
    }

}