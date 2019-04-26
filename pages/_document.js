import React from 'react';
import Document, {Head, Main, NextScript} from 'next/document';
import JssProvider from 'react-jss/lib/JssProvider';
import htmlescape from 'htmlescape'
import getContext from '../lib/context';

const { StripePublishableKey } = process.env;
const env = { StripePublishableKey };


class MyDocument extends Document {
	render() {
		return (
			<html lang="en">
			<Head>
				{/*1. metadata	*/}
				<meta charSet="utf-8"/>
				<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
				<meta name="google" content="notranslate"/>
				<meta name="theme-color" content="#1976D2"/>
				{/*2. static resources (from CDN)*/}
				<link
					rel="shortcut icon"
					href="https://storage.googleapis.com/builderbook/favicon32.png"
				/>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css?family=Muli:300,400:latin"
				/>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/icon?family=Material+Icons"
				/>
				<link
					rel="stylesheet"
					href="https://storage.googleapis.com/builderbook/nprogress.min.css"
				/>
				<link rel="stylesheet" href="https://storage.googleapis.com/builderbook/vs.min.css"/>
				{/*3. global styles*/}
				{/*<link rel="stylesheet" type="text/css" href="/static/nprogress.css" /> /!* Move to CDN for prod*!/*/}
				<link
					rel="stylesheet"
					href="https://storage.googleapis.com/builderbook/nprogress.min.css"
				/>
				<style>
					{`
				
					   a, a:focus {
					     font-weight: 400;
					     color: #1565C0;
					     text-decoration: none;
					     outline: none
					   }
					   a:hover, button:hover {
					     opacity: 0.75;
					     cursor: pointer
					   }
					   blockquote {
					     padding: 0 1em;
					     color: #555;
					     border-left: 0.25em solid #dfe2e5;
					   }
					   pre {
					     display:block;
					     overflow-x:auto;
					     padding:0.5em;
					     background:#FFF;
					     color: #000;
					     border: 1px solid #ddd;
					   }
					   code {
					     font-size: 14px;
					     background: #FFF;
					     padding: 3px 5px;
					   }
					 `}
				</style>

			</Head>
			<body style={{
				font: '16px Muli',
				color: '#222',
				margin: '0px auto',
				fontWeight: '300',
				lineHeight: '1.5em',
				backgroundColor: '#F7F9FC',
			}}
			>
			<Main/>
			<script dangerouslySetInnerHTML={{ __html: `__ENV__ = ${htmlescape(env)}` }} />
			<NextScript/>
			</body>
			</html>
		)
	}
}

MyDocument.getInitialProps = ({renderPage}) => {
	const pageContext = getContext();

	const page = renderPage(Component => props => (
		<JssProvider
			registry={pageContext.sheetsRegistry}
			generateClassName={pageContext.generateClassName}
		>
			<Component pageContext={pageContext} {...props} />
		</JssProvider>
	));

	return {
		...page,
		pageContext,
		styles: (
			<style
				id="jss-server-side"
				dangerouslySetInnerHTML={{
					__html: pageContext.sheetsRegistry.toString(),
				}}
			/>
		),
	};
};

export default MyDocument
