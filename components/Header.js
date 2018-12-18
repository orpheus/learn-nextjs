import Link from 'next/link';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Avatar from '@material-ui/core/Avatar';

import { styleToolbar } from './SharedStyles';

const Header = ({user}) => (
	<div>
		<Toolbar style={styleToolbar}>
			<Grid container direction="row" justify="space-around" align="center">
				<Grid item sm={10} xs={9} style={{ textAlign: 'left' }}>
					{user ? (
						<div>
							<Hidden smDown>
								<Link prefetch href="/">
									<a style={{ marginRight: '20px' }}>Settings</a>
								</Link>
							</Hidden>
						</div>
					) : (
						<Link prefetch href="/">
							<Avatar
								src="https://storage.googleapis.com/builderbook/logo.svg"
								alt="Builder Book logo"
								style={{ margin: '0px auto 0px 20px' }}
							/>
						</Link>
					)}
				</Grid>
				<Grid item sm={1} xs={3} style={{ textAlign: 'right' }}>
					{user ? (
						<div style={{ whiteSpace: ' nowrap' }}>
							<Avatar
								src={user.avatarUrl}
								alt={user.displayName}
								style={{ margin: '0px auto 0px 20px' }}
							/>
						</div>
					) : (
						<Link prefetch href="/login">
							<a style={{ margin: '0px 20px 0px auto' }}>Log in</a>
						</Link>
					)}
				</Grid>
			</Grid>
		</Toolbar>
	</div>
);

Header.propTypes = {
	user: PropTypes.shape({
		avatarUrl: PropTypes.string,
		displayName: PropTypes.string,
	}),
};

Header.defaultProps = {
	user: null,
};

export default Header;