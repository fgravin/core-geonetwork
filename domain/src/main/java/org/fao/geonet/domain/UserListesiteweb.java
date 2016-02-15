package org.fao.geonet.domain;

import org.jdom.Element;

import javax.persistence.*;
import java.util.IdentityHashMap;

/**
 * The mapping between user and the LDAP listesiteweb list.
 *
 * @author fgravin
 */
@Entity
@Access(AccessType.PROPERTY)
@Table(name = "UserListesiteweb")
public class UserListesiteweb extends GeonetEntity {

    private UserListesitewebId _id;
    private User _user;


    /**
     * Get the id object of the user listsiteweb entity.
     *
     * @return the id object of the user listsiteweb entity.
     */
    @EmbeddedId
    public UserListesitewebId getId() {
        return _id;
    }

    /**
     * Set the id object of the user listsiteweb entity.
     *
     * @param id the id object of the user listsiteweb entity.
     */
    public void setId(UserListesitewebId id) {
        this._id = id;
    }

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", referencedColumnName = "id")
    public User getUser() {
        return _user;
    }

    public UserListesiteweb setUser(User user) {
        this._user = user;
        getId().setUserId(_user.getId());
        return this;
    }

    @Override
    protected Element asXml(IdentityHashMap<Object, Void> alreadyEncoded) {
        return new Element("record")
                .addContent(new Element("user").setText(""+getId().getUserId()))
                .addContent(new Element("listesiteweb").setText(""+getId().getListesiteweb()));
    }
}
