import  ItemComponent from '../components/Item';
import { shallow } from 'enzyme';

const fakeItem = {
	id: 'ABC123',
	title: 'A Cool Item',
	price: 5000,
	description: 'This item is really cool!',
	image: 'dog.jpg',
	largeImage: 'largeDog.jpg'
};

describe('<Item/>', () => {
	it('renders and displays properly', () => {
		const wrapper = shallow(<ItemComponent item={fakeItem} />);
		const PriceTag = wrapper.find('PriceTag');
		expect(PriceTag.children().text()).toBe('$50');
		expect(wrapper.find('Title a').text()).toBe(fakeItem.title);
	});

	it('renders the image properly', () => {
		const wrapper = shallow(<ItemComponent item={fakeItem} />);
		const image = wrapper.find('img');
		expect(image.props().src).toBe(fakeItem.image);
		expect(image.props().alt).toBe(fakeItem.title);
	})

	it('renders out the buttons properly', () => {
		const wrapper = shallow(<ItemComponent item={fakeItem} />);
		const ButtonList = wrapper.find('.buttonList');
		expect(ButtonList.children()).toHaveLength(3);
		expect(ButtonList.find('Link')).toHaveLength(1);
		expect(ButtonList.find('Link')).toBeTruthy();
		expect(ButtonList.find('AddToCart')).toBeTruthy();
		expect(ButtonList.find('DeleteItem')).toBeTruthy();
	});
})