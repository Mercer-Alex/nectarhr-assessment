import { mount, flushPromises } from '@vue/test-utils';
import WeatherFetcher from '@/components/WeatherFetcher.vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('WeatherFetcher.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders input and button', () => {
    const wrapper = mount(WeatherFetcher);
    expect(wrapper.find('input').exists()).toBe(true);
    expect(wrapper.find('button').text()).toBe('Get Forecast');
  });

  it('fetches forecast and displays result on success', async () => {
    const mockResponse = {
      properties: {
        periods: [
          {
            name: 'Tonight',
            detailedForecast: 'Clear skies with a low of 50°F.'
          }
        ]
      }
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    })

    const wrapper = mount(WeatherFetcher);
    await wrapper.find('input').setValue('UT');
    await wrapper.find('form').trigger('submit.prevent');

    await flushPromises();

    expect(wrapper.text()).toContain('Tonight');
    expect(wrapper.text()).toContain('Clear skies with a low of 50°F.');
  })

  it('displays API error message on bad response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'State code not found' })
    });

    const wrapper = mount(WeatherFetcher);
    await wrapper.find('input').setValue('XX');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('State code not found');
  });

  it('displays fallback error on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const wrapper = mount(WeatherFetcher);
    await wrapper.find('input').setValue('CA');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Failed to fetch weather');
  });
})
