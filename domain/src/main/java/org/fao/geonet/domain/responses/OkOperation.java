package org.fao.geonet.domain.responses;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "response")
@XmlAccessorType(XmlAccessType.FIELD)
public class OkOperation {

    @XmlElement
    private String operation;

    public OkOperation() {}

    public OkOperation(String operation) {
        this.operation = operation;
    }
}
