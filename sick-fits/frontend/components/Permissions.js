import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import Error from './ErrorMessage';
import Table from './styles/Table'
import SickButton from './styles/SickButton'

const possiblePermissions = [
	'ADMIN', 'USER', 'ITEMCREATE', 'ITEMUPDATE', 'ITEMDELETE', 'PERMISSIONUPDATE'
];

const UPDATE_PERMISSIONS_MUTATION = gql`
	mutation updatePermissions($permissions: [Permission], $userId: ID!) {
		updatePermissions(permissions: $permissions, userId: $userId) {
			id
			permissions
			name
			email
		}
	}
`;

const ALL_USERS_QUERY = gql`
	query {
		users {
			id
			name
			email
			permissions
		}
	}
`;

const Permissions = props => (
	<Query
		query={ALL_USERS_QUERY}>
		{({ data, loading, error }) => (
			<div>
				<Error error={error} />
				<Table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							{possiblePermissions.map(permission => <th key={permission}>{permission}</th>)}
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{data.users.map(user => <UserPermissions key={user.id} user={user} />)}
					</tbody>
				</Table>
			</div>
		)}
	</Query>
);

class UserPermissions extends React.Component {
	static propTypes = {
		user: PropTypes.shape({
			name: PropTypes.string,
			email: PropTypes.string,
			id: PropTypes.string,
			Permissions: PropTypes.array
		}).isRequired
	}
	state = {
		permissions: this.props.user.permissions
	}
	handlePermissionCahnge = (e) => {
		const checkbox = e.target;
		let updatedPermissions = [...this.state.permissions];
		if (checkbox.checked) {
			updatedPermissions.push(checkbox.value);
		} else {
			updatedPermissions = updatedPermissions.filter(permission => permission !== checkbox.value);
		}
		this.setState({ permissions: updatedPermissions });
	}
	render() {
		const { user } = this.props;
		return (
			<Mutation mutation={UPDATE_PERMISSIONS_MUTATION} variables={{
				permissions: this.state.permissions,
				userId: this.props.user.id
			}}>
				{(updatePermissions, { loading, error }) => (
					<>
						{error && <tr><td colspan="8"><Error error={error}/></td></tr>}
						<tr>
							<td>{user.name}</td>
							<td>{user.email}</td>
							{possiblePermissions.map(permission => (
								<td key={`user_${permission}`}>
									<label htmlFor={`${user.id}-permission-${permission}`}>
										<input
											id={`${user.id}-permission-${permission}`}
											type="checkbox"
											checked={this.state.permissions.includes(permission)}
											value={permission}
											onChange={this.handlePermissionCahnge} />
									</label>
								</td>
							))}
							<td>
								<SickButton
									type="button"
									disabled={loading}
									onClick={updatePermissions}>
									UPDAT{loading ? 'ING' : 'E'}
								</SickButton>
							</td>
						</tr>
					</>
				)}
			</Mutation>
		);
	}
}

export default Permissions;