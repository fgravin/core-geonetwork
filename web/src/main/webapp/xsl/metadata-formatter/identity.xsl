<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output omit-xml-declaration="yes" method="html" doctype-system="html" indent="yes"
              encoding="UTF-8"/>

    <xsl:template match="text()" priority="2">
    </xsl:template>
	<xsl:template match="/root/metadata" priority="1">
          <xsl:copy-of select="./*"></xsl:copy-of>
    </xsl:template>
    
</xsl:stylesheet>