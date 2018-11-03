import Link from 'next/link';
import NavStyled from './styles/NavStyles';

const Nav = () => (
	<NavStyled>
		<Link href="/items">
			<a>Shop</a>
		</Link>
		<Link href="/sell">
			<a>Sell</a>
		</Link>
		<Link href="/signup">
			<a>Signup</a>
		</Link>
		<Link href="/orders">
			<a>Orders</a>
		</Link>
		<Link href="/me">
			<a>Account</a>
		</Link>
	</NavStyled>
);

export default Nav;
