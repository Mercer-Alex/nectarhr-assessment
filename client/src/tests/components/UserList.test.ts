import { mount, flushPromises } from '@vue/test-utils'
import UserList from '@/components/UserList.vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('UserList', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  
  it('renders with default content', () => {
    const wrapper = mount(UserList);
    expect(wrapper.text()).toContain('User Data');
    expect(wrapper.text()).toContain('All Users');
    expect(wrapper.text()).toContain('Duplicate User Names');
    expect(wrapper.text()).toContain('Users by Country');
  })

  it('toggles All Users section when clicked', async () => {
    const wrapper = mount(UserList);
    const header = wrapper.find('.user-table-all h3');
    expect(wrapper.find('.all-users select').exists()).toBe(true);
    await header.trigger('click');
    expect(wrapper.find('.all-users select').exists()).toBe(false);
    await header.trigger('click');
    expect(wrapper.find('.all-users select').exists()).toBe(true);
  });

  it('toggles Duplicate User Names section when clicked', async () => {
    const wrapper = mount(UserList);
    const header = wrapper.find('.user-table-duplicates h3');
    expect(wrapper.find('.user-table-duplicates select').exists()).toBe(true);
    await header.trigger('click');
    expect(wrapper.find('.user-table-duplicates select').exists()).toBe(false);
  });

  it('toggles Users by Country section when clicked', async () => {
    const wrapper = mount(UserList);
    const header = wrapper.find('.user-table-country h3');
    expect(wrapper.find('.user-table-country select').exists()).toBe(true);
    await header.trigger('click');
    expect(wrapper.find('.user-table-country select').exists()).toBe(false);
  });

  it('calls fetchUsers and fetchDuplicateUsers on mount', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      json: async () => [],
    });
    global.fetch = fetchSpy;

    mount(UserList);
    await flushPromises();

    expect(fetchSpy).toHaveBeenCalledWith('/api/users?active=false');
    expect(fetchSpy).toHaveBeenCalledWith('/api/users/duplicate-names?count=2&active=false');
  });

  it('fetches users by country when selectedCountry changes', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => [],
    });
    global.fetch = fetchMock;

    const wrapper = mount(UserList);
    await flushPromises();

    await wrapper.find('.user-table-country select').setValue('US');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith('/api/users/by-country/US?active=false');
  });

  it('filters users by active checkbox toggle', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => [],
    });
    global.fetch = fetchMock;

    const wrapper = mount(UserList);
    await flushPromises();

    const checkbox = wrapper.findAll('input[type="checkbox"]').at(0);
    await checkbox?.setValue(true);
    await wrapper.find('.user-table-all button').trigger('click');

    expect(fetchMock).toHaveBeenCalledWith('/api/users?active=true');
  });
})
