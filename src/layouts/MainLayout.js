import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { css } from '@emotion/core';
import { GlobalHeader } from '@newrelic/gatsby-theme-newrelic';
import { graphql, useStaticQuery } from 'gatsby';
import Cookies from 'js-cookie';
import Footer from '../components/Footer';
import MobileHeader from '../components/MobileHeader';
import Sidebar from '../components/Sidebar';
import CookieApprovalDialog from '../components/CookieApprovalDialog';
import '../components/styles.scss';
import usePageContext from '../hooks/usePageContext';
import useResizeObserver from '../hooks/useResizeObserver';
import { useLocation } from '@reach/router';

const gdprConsentCookieName = 'newrelic-gdpr-consent';

const MainLayout = ({ children }) => {
  const {
    site: { layout, siteMetadata },
  } = useStaticQuery(graphql`
    query {
      site {
        layout {
          contentPadding
          maxWidth
        }
        siteMetadata {
          repository
        }
      }
    }
  `);

  const location = useLocation();
  const { fileRelativePath } = usePageContext();
  const [headerRef, headerEntry] = useResizeObserver();
  const [cookieConsent, setCookieConsent] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isComponentDoc = fileRelativePath.includes(
    'src/markdown-pages/components'
  );
  const editUrl = isComponentDoc
    ? null
    : `${siteMetadata.repository}/blob/main/${fileRelativePath}`;

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const consentValue = Cookies.get(gdprConsentCookieName) === 'true';
    setCookieConsent(consentValue);

    consentValue && window.trackGoogleAnalytics();
  }, [cookieConsent]);

  return (
    <div
      css={css`
        --global-header-height: ${headerEntry?.contentRect.height}px;
        --sidebar-width: 300px;

        min-height: 100vh;
        display: grid;
        grid-template-rows: auto 1fr;
      `}
    >
      <div
        ref={headerRef}
        css={css`
          position: sticky;
          z-index: 99;
          top: 0;
        `}
      >
        <GlobalHeader editUrl={editUrl} />
      </div>
      <MobileHeader
        css={css`
          @media (min-width: 761px) {
            display: none;
          }
        `}
        isOpen={isMobileNavOpen}
        toggle={() => setIsMobileNavOpen(!isMobileNavOpen)}
      />
      <div
        css={css`
          display: ${isMobileNavOpen ? 'none' : 'grid'};
          grid-template-areas:
            'sidebar content'
            'sidebar footer';
          grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
          grid-template-rows: 1fr auto;
          grid-gap: ${layout.contentPadding};
          width: 100%;
          max-width: ${layout.maxWidth};
          margin: 0 auto;

          @media screen and (max-width: 760px) {
            grid-template-columns: minmax(0, 1fr);
          }
        `}
      >
        <Sidebar
          css={css`
            position: fixed;
            top: var(--global-header-height);
            width: var(--sidebar-width);
            height: calc(100vh - var(--global-header-height));
            overflow: auto;

            @media (max-width: 760px) {
              display: none;
            }
          `}
        />
        <div
          css={css`
            grid-area: sidebar;
          `}
        />
        <article
          data-swiftype-name="body"
          data-swiftype-type="text"
          css={css`
            grid-area: content;
            padding-top: ${layout.contentPadding};
            padding-right: ${layout.contentPadding};
          `}
        >
          {children}
        </article>
        <Footer
          css={css`
            grid-area: footer;
            border-top: 1px solid var(--divider-color);
            padding: ${layout.contentPadding} 0;
            margin-right: ${layout.contentPadding};
          `}
        />
      </div>
      <CookieApprovalDialog setCookieConsent={setCookieConsent} />
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;
