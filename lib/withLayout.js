import React from 'react';
import PropTypes from 'prop-types';
import {MuiThemeProvider} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline'
import Router from 'next/router';
import NProgress from 'nprogress';

import getContext from './context';
import Header from '../components/Header';
import Notifier from '../components/Notifier';

// import dynamic from 'next/dynamic'
// const Header = dynamic(import('../components/Header'), { ssr: false });

Router.onRouteChangeStart = () => NProgress.start();
Router.onRouteChangeComplete = () => NProgress.done();
Router.onRouteChangeError = () => NProgress.done();

function withLayout(BaseComponent, {noHeader = false} = {}) {
	class App extends React.Component {
		constructor(props) {
			super(props);
			const {pageContext} = this.props;
			this.pageContext = pageContext || getContext();
		}

		componentDidMount() {
			const jssStyles = document.querySelector('#jss-server-side');
			if (jssStyles && jssStyles.parentNode) {
				jssStyles.parentNode.removeChild(jssStyles);
			}
		}

		render() {
			return (
				<MuiThemeProvider
					theme={this.pageContext.theme}
					sheetsManager={this.pageContext.sheetsManager}
				>
					<CssBaseline/>
					<div>
						{noHeader ? null : <Header {...this.props} />}
						<BaseComponent {...this.props} />
						<Notifier />
					</div>
				</MuiThemeProvider>
			);
		}
	}

	App.getInitialProps = (ctx) => {
		console.log('getInitialProps: withLayout', !!ctx.req)
		if (BaseComponent.getInitialProps) {
			// console.log('BaseComponent has Init props')
			return BaseComponent.getInitialProps(ctx);
		}

		return {};
	};

	App.propTypes = {
		pageContext: PropTypes.object,
	};

	App.defaultProps = {
		pageContext: null,
	};

	return App;
}

export default withLayout;