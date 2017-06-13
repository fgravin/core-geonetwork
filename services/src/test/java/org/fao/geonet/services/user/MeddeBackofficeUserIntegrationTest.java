package org.fao.geonet.services.user;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.Arrays;

import org.fao.geonet.constants.Params;
import org.fao.geonet.domain.User;
import org.fao.geonet.repository.UserRepository;
import org.fao.geonet.services.AbstractServiceIntegrationTest;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.context.WebApplicationContext;

@RunWith(SpringJUnit4ClassRunner.class)
public class MeddeBackofficeUserIntegrationTest extends AbstractServiceIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepo;

    private static final String USERTESTNAME = "backofficetests";
    private static final String USERTESTEMAIL = "medde_geoide@aaaa.com";

    @Before
    public void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup((WebApplicationContext) _applicationContext).build();
    }

    @Test
    public void testGeoIdeBackOfficeUsersList() throws Exception {
        MockHttpSession admSession = loginAsAdmin();

        // Note: this will be prefixed by the node name (usually /srv)
        ResultActions rs = mockMvc.perform(MockMvcRequestBuilders.get("/eng/geoide.backoffice.users.list")
                .session(admSession));
        MvcResult result = rs.andReturn();
        String output = result.getResponse().getContentAsString();

        assertTrue("Unexpected result: output should contain <name>admin</name>",
                output.contains("<name>admin</name>"));
    }

    @Test
    public void testGeoIdeBackOfficeUserCreate() throws Exception {
        MockHttpSession admSession = loginAsAdmin();
        MultiValueMap<String,String> params = new LinkedMultiValueMap<String,String>();
        params.put(Params.OPERATION, Arrays.asList(new String[]{ Params.Operation.NEWUSER }));
        params.put(Params.USERNAME, Arrays.asList(new String[]{ USERTESTNAME }));
        params.put(Params.SURNAME, Arrays.asList(new String[]{ "backoffice_integration_test" }));
        params.put(Params.NAME, Arrays.asList(new String[]{ "medde_geoide" }));
        params.put(Params.PASSWORD, Arrays.asList(new String[]{ "superSecretPassword123" }));
        params.put(Params.EMAIL, Arrays.asList(new String[]{ "medde_geoide@aaaa.com" }));
        params.put(Params.ENABLED, Arrays.asList(new String[]{ "true" }));

        ResultActions rs = mockMvc.perform(MockMvcRequestBuilders.get("/eng/geoide.backoffice.user.create")
                .session(admSession)
                .accept(MediaType.APPLICATION_XML)
                .params(params));
        MvcResult result = rs.andReturn();
        String output = result.getResponse().getContentAsString();

        assertTrue("Unexpected response, '<response><operation>added</operation></response>' expected in the output",
                    output.contains("<response><operation>added</operation></response>"));
    }

    @Test
    public void testGeoIdeBackOfficeUserUpdate() throws Exception {
        MockHttpSession admSession = loginAsAdmin();
        insertTestUser(admSession);
        User testuser = userRepo.findOneByEmail(USERTESTEMAIL);

        MultiValueMap<String,String> params = new LinkedMultiValueMap<String,String>();
        params.put(Params.ID, Arrays.asList(new String[]{ String.format("%d", testuser.getId()) }));
        params.put(Params.USERNAME, Arrays.asList(new String[]{ USERTESTNAME }));
        params.put(Params.OPERATION, Arrays.asList(new String[]{ Params.Operation.EDITINFO }));
        params.put(Params.SURNAME, Arrays.asList(new String[]{ "backoffice_integration_test_updated" }));
        params.put(Params.NAME, Arrays.asList(new String[]{ "medde_geoide" }));
        params.put(Params.EMAIL, Arrays.asList(new String[]{ USERTESTEMAIL }));
        params.put(Params.ENABLED, Arrays.asList(new String[]{ "true" }));

        ResultActions rs = mockMvc.perform(MockMvcRequestBuilders.get("/eng/geoide.backoffice.user.update")
                .session(admSession)
                .accept(MediaType.APPLICATION_XML)
                .params(params));
        MvcResult result = rs.andReturn();
        String output = result.getResponse().getContentAsString();
        User testuser2 = userRepo.findOneByEmail(USERTESTEMAIL);
        assertTrue("Unexpected answer from update webservice, expected "
                + "'<response><operation>updated</operation></response>' in the output",
                output.contains("<response><operation>updated</operation></response>"));
        assertNotNull("Newly updated user not found", testuser2);
        String surname = testuser2.getSurname();
        userRepo.delete(testuser2);

        assertTrue("Unexpected user, expected 'backoffice_integration_test_updated' as surname",
                    surname != null && surname.equals("backoffice_integration_test_updated"));
    }

    private void insertTestUser(MockHttpSession session) throws Exception {
        MultiValueMap<String,String> params = new LinkedMultiValueMap<String,String>();
        params.put(Params.OPERATION, Arrays.asList(new String[]{ Params.Operation.NEWUSER }));
        params.put(Params.USERNAME, Arrays.asList(new String[]{ USERTESTNAME }));
        params.put(Params.SURNAME, Arrays.asList(new String[]{ "backoffice_integration_test" }));
        params.put(Params.NAME, Arrays.asList(new String[]{ "medde_geoide" }));
        params.put(Params.PASSWORD, Arrays.asList(new String[]{ "superSecretPassword123" }));
        params.put(Params.EMAIL, Arrays.asList(new String[]{ USERTESTEMAIL }));
        params.put(Params.ENABLED, Arrays.asList(new String[]{ "true" }));
        ResultActions rs = mockMvc.perform(MockMvcRequestBuilders.get("/eng/geoide.backoffice.user.create")
                .session(session)
                .accept(MediaType.APPLICATION_XML)
                .params(params));
    }
}
