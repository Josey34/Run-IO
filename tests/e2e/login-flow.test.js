const { remote } = require('webdriverio');

describe('Run-IO App Flow Test', () => {
    let driver;

    beforeAll(async () => {
        const capabilities = {
            platformName: 'Android',
            'appium:automationName': 'UiAutomator2',
            'appium:deviceName': 'RRCW2003P9P',
            'appium:app': '../../android/app/build/outputs/apk/release/RUN-IO.apk',
            'appium:noReset': false
        };

        driver = await remote({
            protocol: 'http',
            hostname: '127.0.0.1',
            port: 4723,
            path: '/wd/hub',
            capabilities
        });
    });

    afterAll(async () => {
        if (driver) {
            await driver.deleteSession();
        }
    });

    test('Register to Recommendations Flow', async () => {
        // 1. Navigate to Register Screen
        const registerLink = await driver.$('~register-link');
        await registerLink.click();

        // 2. Register Screen
        await driver.$('~register-name-input').setValue('Test User');
        await driver.$('~register-email-input').setValue('test@example.com');
        await driver.$('~register-password-input').setValue('password123');
        await driver.$('~register-confirm-password-input').setValue('password123');
        await driver.$('~register-button').click();

        // Wait for warning screen
        const warningTitle = await driver.$('~warning-title');
        await warningTitle.waitForDisplayed({ timeout: 5000 });

        // 3. Warning Screen
        const yesButton = await driver.$('~yes-button');
        await yesButton.click();

        // Wait for form screen
        const formTitle = await driver.$('~form-title');
        await formTitle.waitForDisplayed({ timeout: 5000 });

        // 4. Form Data Screen
        await driver.$('~age-input').setValue('25');
        await driver.$('~weight-input').setValue('70');
        await driver.$('~height-input').setValue('170');
        await driver.$('~gender-picker').click();
        await driver.$('~gender-man').click();
        await driver.$('~process-button').click();

        // Wait for challenges screen
        const challengesTitle = await driver.$('~challenges-title');
        await challengesTitle.waitForDisplayed({ timeout: 5000 });

        // 5. Verify Recommendations
        const recommendationElement = await driver.$('~recommendation-section');
        expect(await recommendationElement.isDisplayed()).toBe(true);
    });
});