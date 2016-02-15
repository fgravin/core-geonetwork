package org.fao.geonet.domain;

import javax.persistence.Access;
import javax.persistence.AccessType;
import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;

/**
 * An Id object for {@link UserListesitewebId}
 *
 * @author fgravin
 */
@Embeddable
@Access(AccessType.PROPERTY)
public class UserListesitewebId implements Serializable {

    private static final long serialVersionUID = 2793801901676171677L;
    private int _userId;
    private String _listesiteweb;

    /**
     * Default constructor used by JPA framework.
     */
    public UserListesitewebId() {
        // default constructor for JPA construction.
    }

    /**
     * Convenience constructor.
     *
     * @param userId the user Id..
     * @param listesiteweb the listesiteweb.
     */
    public UserListesitewebId(int userId, String listesiteweb) {
        this._userId = userId;
        this._listesiteweb = listesiteweb;
    }

    @Column(name = "userId", nullable = false)
    public int getUserId() {
        return _userId;
    }

    public void setUserId(int userId) {
        this._userId = userId;
    }


    @Column(name = "listesiteweb", nullable = false, length = 60)
    public String getListesiteweb() {
        return _listesiteweb;
    }

    public void setListesiteweb(String _listesiteweb) {
        this._listesiteweb = _listesiteweb;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((_listesiteweb == null) ? 0 : _listesiteweb.hashCode());
        result = prime * result + _userId;
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        UserListesitewebId other = (UserListesitewebId) obj;
        if (_listesiteweb == null) {
            if (other._listesiteweb != null)
                return false;
        } else if (!_listesiteweb.equals(other._listesiteweb))
            return false;
        if (_userId != other._userId)
            return false;
        return true;
    }

}
