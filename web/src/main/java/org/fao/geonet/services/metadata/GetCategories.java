//=============================================================================
//===	Copyright (C) 2001-2007 Food and Agriculture Organization of the
//===	United Nations (FAO-UN), United Nations World Food Programme (WFP)
//===	and United Nations Environment Programme (UNEP)
//===
//===	This program is free software; you can redistribute it and/or modify
//===	it under the terms of the GNU General Public License as published by
//===	the Free Software Foundation; either version 2 of the License, or (at
//===	your option) any later version.
//===
//===	This program is distributed in the hope that it will be useful, but
//===	WITHOUT ANY WARRANTY; without even the implied warranty of
//===	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
//===	General Public License for more details.
//===
//===	You should have received a copy of the GNU General Public License
//===	along with this program; if not, write to the Free Software
//===	Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
//===
//===	Contact: Jeroen Ticheler - FAO - Viale delle Terme di Caracalla 2,
//===	Rome - Italy. email: geonetwork@osgeo.org
//==============================================================================

package org.fao.geonet.services.metadata;

import jeeves.constants.Jeeves;
import jeeves.interfaces.Service;
import jeeves.resources.dbms.Dbms;
import jeeves.server.ServiceConfig;
import jeeves.server.context.ServiceContext;
import org.fao.geonet.GeonetContext;
import org.fao.geonet.constants.Geonet;
import org.fao.geonet.kernel.AccessManager;
import org.fao.geonet.kernel.DataManager;
import org.fao.geonet.lib.Lib;
import org.fao.geonet.services.Utils;
import org.jdom.Element;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

//=============================================================================

/** Given a metadata id returns all associated categories. Called by the
  * metadata.category service
  */

public class GetCategories implements Service
{
	//--------------------------------------------------------------------------
	//---
	//--- Init
	//---
	//--------------------------------------------------------------------------

	public void init(String appPath, ServiceConfig params) throws Exception {}

	//--------------------------------------------------------------------------
	//---
	//--- Service
	//---
	//--------------------------------------------------------------------------

	public Element exec(Element params, ServiceContext context) throws Exception
	{
		GeonetContext gc = (GeonetContext) context.getHandlerContext(Geonet.CONTEXT_NAME);
		DataManager dataMan = gc.getDataManager();
		AccessManager am = gc.getAccessManager();

		Dbms dbms = (Dbms) context.getResourceManager().open(Geonet.Res.MAIN_DB);

		String id = Utils.getIdentifierFromParameters(params, context);

		//-----------------------------------------------------------------------
		//--- check access
		int iLocalId = Integer.parseInt(id);
		
		if (!dataMan.existsMetadata(dbms, iLocalId))
			throw new IllegalArgumentException("Metadata not found --> " + id);

		Element isOwner = new Element("owner");
		if (am.isOwner(context,id))
			isOwner.setText("true");
		else
			isOwner.setText("false");

		//-----------------------------------------------------------------------
		//--- retrieve metadata categories

		HashSet hsMetadataCat = new HashSet();

		List mdCat = dbms.select("SELECT categoryId FROM MetadataCateg WHERE metadataId=?",new Integer(id)).getChildren();

		for(int i=0; i<mdCat.size(); i++)
		{
			Element el = (Element) mdCat.get(i);
			hsMetadataCat.add(el.getChildText("categoryid"));
		}

		//-----------------------------------------------------------------------
		//--- retrieve groups operations

		Element elCateg = Lib.local.retrieve(dbms, "Categories");

		List list = elCateg.getChildren();

		for(int i=0; i<list.size(); i++)
		{
			Element el = (Element) list.get(i);

			el.setName(Geonet.Elem.CATEGORY);

			//--- get all operations that this group can do on given metadata

			if (hsMetadataCat.contains(el.getChildText("id")))
				el.addContent(new Element("on"));
		}


		//-----------------------------------------------------------------------
		//--- retrieve groups operations

		Set<String> userGroups = am.getUserGroups(dbms, context.getUserSession(), context.getIpAddress(), false);

		Element elOper = Lib.local.retrieve(dbms, "Operations").setName(Geonet.Elem.OPERATIONS);

		Element elGroup = Lib.local.retrieve(dbms, "Groups");

		List listGroup = elGroup.getChildren();

		for(int i=0; i<listGroup.size(); i++)
		{
			Element el = (Element) listGroup.get(i);
			
			el.setName(Geonet.Elem.GROUP);
			String sGrpId = el.getChildText("id");
			int grpId = Integer.parseInt(sGrpId);

			//--- get all group informations (user member and user profile)
			
			el.setAttribute("userGroup", userGroups.contains(sGrpId) ? "true" : "false");
			
			String query = "SELECT profile FROM UserGroups WHERE userId=? AND groupId=?";
			Element profiles = dbms.select(query, context.getUserSession().getUserIdAsInt(), grpId);
			List profilesList = profiles.getChildren();
			for (Object aProfile : profilesList) {
				Element pEl = (Element) aProfile;
				String profile = pEl.getChildText("profile");
				el.addContent(new Element("userProfile").setText(profile));
			}


			//--- get all operations that this group can do on given metadata

			query = "SELECT operationId FROM OperationAllowed WHERE metadataId=? AND groupId=?";

			List listAllow = dbms.select(query, new Integer(id), grpId).getChildren();

			//--- now extend the group list adding proper operations

			List listOper = elOper.getChildren();

			for(int j=0; j<listOper.size(); j++)
			{
				String operId = ((Element) listOper.get(j)).getChildText("id");

				Element elGrpOper = new Element(Geonet.Elem.OPER)
													.addContent(new Element(Geonet.Elem.ID).setText(operId));

				boolean bFound = false;

				for(int k=0; k<listAllow.size(); k++)
				{
					Element elAllow = (Element) listAllow.get(k);

					if (operId.equals(elAllow.getChildText("operationid")))
					{
						bFound = true;
						break;
					}
				}

				if (bFound)
					elGrpOper.addContent(new Element(Geonet.Elem.ON));

				el.addContent(elGrpOper);
			}
		}
		
		//-----------------------------------------------------------------------
		//--- put all together

		Element elRes = new Element(Jeeves.Elem.RESPONSE)
										.addContent(new Element(Geonet.Elem.ID).setText(id))
										.addContent(elCateg)
										.addContent(elOper)
										.addContent(elGroup)
										.addContent(isOwner);

		return elRes;
	}
}

//=============================================================================


