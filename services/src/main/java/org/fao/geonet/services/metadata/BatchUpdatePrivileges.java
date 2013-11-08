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
import jeeves.server.ServiceConfig;
import jeeves.server.UserSession;
import jeeves.server.context.ServiceContext;
import org.fao.geonet.GeonetContext;
import org.fao.geonet.constants.Geonet;
import org.fao.geonet.domain.Metadata;
import org.fao.geonet.domain.Profile;
import org.fao.geonet.kernel.AccessManager;
import org.fao.geonet.kernel.DataManager;
import org.fao.geonet.kernel.SelectionManager;
import org.fao.geonet.repository.MetadataRepository;
import org.fao.geonet.services.NotInReadOnlyModeService;
import org.jdom.Element;

import java.util.*;

import static org.fao.geonet.kernel.SelectionManager.SELECTION_METADATA;

/**
 * Stores all operations allowed for a metadata.
 */
public class BatchUpdatePrivileges extends NotInReadOnlyModeService {
	//--------------------------------------------------------------------------
	//---
	//--- Init
	//---
	//--------------------------------------------------------------------------

	public void init(String appPath, ServiceConfig params) throws Exception {
        super.init(appPath, params);
    }

	//--------------------------------------------------------------------------
	//---
	//--- Service
	//---
	//--------------------------------------------------------------------------

    public Element serviceSpecificExec(Element params, ServiceContext context) throws Exception
	{
		GeonetContext gc = (GeonetContext) context.getHandlerContext(Geonet.CONTEXT_NAME);
		DataManager   dm = gc.getBean(DataManager.class);
		AccessManager accessMan = gc.getBean(AccessManager.class);
		UserSession   us = context.getUserSession();

		context.info("Get selected metadata");
		SelectionManager sm = SelectionManager.getManager(us);

		Set<Integer> metadata = new HashSet<Integer>();
		Set<String> notFound = new HashSet<String>();
		Set<Integer> notOwner = new HashSet<Integer>();

		synchronized(sm.getSelection(SELECTION_METADATA)) {
		for (Iterator<String> iter = sm.getSelection(SELECTION_METADATA).iterator(); iter.hasNext();) {
			String uuid = iter.next();

			//--- check access

			Metadata info = context.getBean(MetadataRepository.class).findOneByUuid(uuid);
			if (info == null) {
				notFound.add(uuid);
			} else if (!accessMan.isOwner(context, String.valueOf(info.getId()))) {
				notOwner.add(info.getId());
			} else {

				//--- remove old operations
				boolean skip = false;

				//--- in case of owner, privileges for groups 0,1 and GUEST are 
				//--- disabled and are not sent to the server. So we cannot remove them
				boolean isAdmin = Profile.Administrator == us.getProfile();
				boolean isReviewer= Profile.Reviewer == us.getProfile();

				if (us.getUserIdAsInt() == info.getSourceInfo().getOwner() && !isAdmin && !isReviewer) {
                    skip = true;
                }

                // GEOCAT
                final boolean published = UnpublishInvalidMetadataJob.isPublished(id, dbms);
                boolean publishedAgain = false;
                // END GEOCAT
				dm.deleteMetadataOper(context, "" + info.getId(), skip);

				//--- set new ones
				@SuppressWarnings("unchecked")
                List<Element> list = params.getChildren();

				for (Element el : list) {
					String name  = el.getName();

					if (name.startsWith("_")) {
						StringTokenizer st = new StringTokenizer(name, "_");

						String groupId = st.nextToken();
						String operId  = st.nextToken();

                        if(Integer.parseInt(groupId) == 1 && Integer.parseInt(operId) == 0) {
                            publishedAgain = true;
                        }

						dm.setOperation(context, "" + info.getId(), groupId, operId);
					}
				}
				metadata.add(info.getId());
                if(published && !publishedAgain) {
                    new UnpublishInvalidMetadataJob.Record(uuid, Validity.UNKNOWN, false, context.getUserSession().getUsername(), "Manually unpublished by user", "").insertInto(dbms);
                } else if (!published && publishedAgain) {
                    new UnpublishInvalidMetadataJob.Record(uuid, Validity.UNKNOWN, true, context.getUserSession().getUsername(), "Manually published by user", "").insertInto(dbms);
                }
			}
		}
		}

		//--- reindex metadata
		context.info("Re-indexing metadata");
		BatchOpsMetadataReindexer r = new BatchOpsMetadataReindexer(dm, metadata);
		r.process();

		// -- for the moment just return the sizes - we could return the ids
		// -- at a later stage for some sort of result display
		return new Element(Jeeves.Elem.RESPONSE)
					.addContent(new Element("done")    .setText(metadata.size()+""))
					.addContent(new Element("notOwner").setText(notOwner.size()+""))
					.addContent(new Element("notFound").setText(notFound.size()+""));
	}
}