package iso19139;

import com.google.common.collect.Lists;
import jeeves.server.context.ServiceContext;
import org.fao.geonet.guiservices.metadata.GetRelated;
import org.fao.geonet.languages.IsoLanguagesMapper;
import org.fao.geonet.services.metadata.format.AbstractFormatterTest;
import org.fao.geonet.services.metadata.format.FormatType;
import org.fao.geonet.services.metadata.format.FormatterParams;
import org.fao.geonet.services.metadata.format.groovy.Environment;
import org.fao.geonet.services.metadata.format.groovy.EnvironmentImpl;
import org.fao.geonet.services.metadata.format.groovy.Functions;
import org.fao.geonet.utils.Xml;
import org.jdom.Attribute;
import org.jdom.Content;
import org.jdom.Element;
import org.jdom.Text;
import org.junit.Ignore;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.File;
import java.util.List;

/**
 * @author Jesse on 10/17/2014.
 */
public class FullViewFormatterTest extends AbstractFormatterTest {

    @Autowired
    private IsoLanguagesMapper mapper;

    @Test @Ignore
    @SuppressWarnings("unchecked")
    public void testPrintFormat() throws Exception {
        final FormatType formatType = FormatType.testpdf;
        final MockHttpServletResponse response = new MockHttpServletResponse();

        Format format = new Format(formatType, response).invoke();
        Functions functions = format.getFunctions();
        String view = format.getView();

        List<String> excludes = excludes();

        final Element xmlEl = Xml.loadString(xml, false);
        final List text = Lists.newArrayList(Xml.selectNodes(xmlEl, "*//node()[not(@codeList)]/text()"));
        text.addAll(Lists.newArrayList(Xml.selectNodes(xmlEl, "*//node()[@codeList]/@codeListValue")));

        StringBuilder missingStrings = new StringBuilder();
        for (Object t : text) {
            final String path;
            final String requiredText;
            if (t instanceof Text) {
                requiredText = ((Text) t).getTextTrim();
                path = getXPath((Content) t).trim();
            } else if (t instanceof Attribute) {
                Attribute attribute = (Attribute) t;
                final String codelist = attribute.getParent().getAttributeValue("codeList");
                final String code = attribute.getValue();
                requiredText = functions.codelistValueLabel(codelist, code);
                path = getXPath(attribute.getParent()).trim() + "> @codeListValue";
            } else {
                throw new AssertionError(t.getClass() + " is not handled");
            }
            if (!requiredText.isEmpty() && !view.contains(requiredText)) {
                if (!excludes.contains(path)) {
                    missingStrings.append("\n").append(path).append(" -> ").append(requiredText);
                }
            }
        }

        if (missingStrings.length() > 0) {
            throw new AssertionError("The following text elements are missing from the view:" + missingStrings);
        }
    }

    protected List<String> excludes() {
        return Lists.newArrayList(
                "> gmd:MD_Metadata > gmd:identificationInfo > gmd:MD_DataIdentification > gmd:citation > gmd:CI_Citation > gmd:title > " +
                "gco:PT_FreeText > gco:textGroup > gmd:LocalisedCharacterString > Text"
        );
    }

    private String getXPath(Content el) {
        String path = "";
        if (el.getParentElement() != null) {
            path = getXPath(el.getParentElement());
        }
        if (el instanceof Element) {
            return path + " > " + ((Element) el).getQualifiedName();
        } else {
            return path + " > " + el.getClass().getSimpleName();
        }
    }

    @Override
    protected File getTestMetadataFile() {
        final String mdFile = FullViewFormatterTest.class.getResource("/iso19139/example.xml").getFile();
        return new File(mdFile);
    }

    private class Format {
        private FormatType formatType;
        private MockHttpServletResponse response;
        private Functions functions;
        private String view;

        public Format(FormatType formatType, MockHttpServletResponse response) {
            this.formatType = formatType;
            this.response = response;
        }

        public Functions getFunctions() {
            return functions;
        }

        public String getView() {
            return view;
        }

        public Format invoke() throws Exception {
            MockHttpServletRequest request = new MockHttpServletRequest();

            GetRelated related = Mockito.mock(GetRelated.class);
            Element relatedXml = Xml.loadFile(FullViewFormatterTest.class.getResource("relations.xml"));
            Mockito.when(related.getRelated(Mockito.<ServiceContext>any(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyString(),
                    Mockito.anyInt(), Mockito.anyInt(), Mockito.anyBoolean())).thenReturn(relatedXml);
            _applicationContext.getBeanFactory().registerSingleton("getRelated", related);

            final String formatterId = "full_view";
            FormatterParams fparams = getFormatterFormatterParamsPair(request, formatterId).two();
            Environment env = new EnvironmentImpl(fparams, mapper);
            functions = new Functions(fparams, env);

//            measureFormatterPerformance(request, formatterId);

//            formatService.exec("eng", FormatType.html.name(), "" + id, null, formatterId, "true", false, request, response);
            formatService.exec("eng", formatType.name(), "" + id, null, formatterId, "true", false, request, response);
            view = response.getContentAsString();
//            Files.write(view, new File("e:/tmp/view.html"), Constants.CHARSET);

            return this;
        }
    }
}
