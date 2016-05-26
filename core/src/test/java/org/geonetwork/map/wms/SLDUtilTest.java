package org.geonetwork.map.wms;

import org.custommonkey.xmlunit.Diff;
import org.custommonkey.xmlunit.XMLTestCase;
import org.custommonkey.xmlunit.XMLUnit;
import org.fao.geonet.utils.Xml;
import org.jdom.Element;
import org.jdom.output.XMLOutputter;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.opengis.filter.Filter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

/**
 * Test SLD helpers.
 */
public class SLDUtilTest extends XMLTestCase {

    @Before
    public void initialize() {
        XMLUnit.setIgnoreWhitespace(true);
    }

    @Test
    public void testParseSLD() throws Exception {
        testInsertFilter("full", "customfilter");
    }

    @Test
    public void testInsertFilterNoFilter() throws Exception {
        testInsertFilter("qgis-nofilter", "simplefilter");
    }

    @Test
    public void testInsertFilterOneFilter() throws Exception {
        testInsertFilter("onefilter", "simplefilter");
    }


    private void testInsertFilter (final String filePattern, final String rulePattern) throws Exception {

        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        Filter customFilter = SLDUtil.generateCustomFilter(new JSONObject(this.getRessourceAsString("sld/test-sld-" + rulePattern + ".json")));

        Element doc = Xml.loadFile(classloader.getResource("sld/sxt-" + filePattern + "-sld.xml"));
        SLDUtil.insertFilter(doc, customFilter);

        XMLOutputter outputter = new XMLOutputter();
        String sldDoc = outputter.outputString(doc);

        XMLUnit.setIgnoreWhitespace(true);

        Diff diff = XMLUnit.compareXML(sldDoc, this.getRessourceAsString("sld/sxt-" + filePattern + "-sld-merged.xml"));
        assertTrue(diff.identical());

    }

    private String getRessourceAsString(String name) throws IOException {
        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        BufferedReader buffer = new BufferedReader(new InputStreamReader(classloader.getResourceAsStream(name)));
        String line = "";
        StringBuilder res = new StringBuilder();
        while ((line = buffer.readLine()) != null)
            res.append(line);

        return res.toString();
    }

}
