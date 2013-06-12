package jeeves.server.overrides;

import java.util.Map;
import java.util.Properties;

import javax.annotation.Nullable;

import org.jdom.Element;
import org.springframework.context.ApplicationContext;
import org.springframework.security.web.access.intercept.FilterInvocationSecurityMetadataSource;
import org.springframework.security.web.access.intercept.FilterSecurityInterceptor;
import org.springframework.security.web.util.RegexRequestMatcher;

import com.google.common.base.Function;
import com.google.common.collect.Iterables;

abstract class AbstractInterceptUrlUpdater implements Updater {

    /**
     * Retrieve a OverridesMetadataSource from a FilterSecurityInterceptor. If the metadata source is not a OverridesMetadataSource then set
     * it on the FilterSecurityInterceptor.
     */
    private static final Function<? super FilterSecurityInterceptor, OverridesMetadataSource> TRANSFORMER = new Function<FilterSecurityInterceptor, OverridesMetadataSource>() {

        @Override
        @Nullable
        public OverridesMetadataSource apply(@Nullable FilterSecurityInterceptor interceptor) {
            if(interceptor == null) {
                throw new IllegalArgumentException();
            } else {
                FilterInvocationSecurityMetadataSource metadataSource = interceptor.getSecurityMetadataSource();
    
                OverridesMetadataSource overrideSource;
                if (metadataSource instanceof OverridesMetadataSource) {
                    overrideSource = (OverridesMetadataSource) metadataSource;
                } else {
                    overrideSource = new OverridesMetadataSource(metadataSource);
                    interceptor.setSecurityMetadataSource(overrideSource);
                }
                return overrideSource;
            }

        }
    };
    protected final RegexRequestMatcher pattern;
    protected String patternString;

    public AbstractInterceptUrlUpdater(Element element) {
        this.pattern = new RegexRequestMatcher(element.getAttributeValue("pattern"), element.getAttributeValue("httpMethod"),
                Boolean.parseBoolean(element.getAttributeValue("caseInsensitive")));
        this.patternString = element.getAttributeValue("pattern");
    }

    /**
     * Update the FilterInvocationSecurityMetadataSource beans
     * 
     * @param sources
     */
    protected abstract void update(Iterable<OverridesMetadataSource> sources);

    @Override
    public Object update(ApplicationContext applicationContext, Properties properties) {
        Map<String, FilterSecurityInterceptor> beansOfType = applicationContext.getBeansOfType(FilterSecurityInterceptor.class);
        Iterable<OverridesMetadataSource> sources = Iterables.transform(beansOfType.values(), TRANSFORMER);
        update(sources);
        return null;
    }
}