const { remote } = require('webdriverio');

describe('Run-IO App Flow Test', function() {
    this.timeout(60000);
    let driver;

    before(async () => {
        const capabilities = {
            platformName: 'Android',
            'appium:automationName': 'UiAutomator2',
            'appium:deviceName': 'RRCW2003P9P',
            'appium:app': 'E:/Josey/kuliah/Tugas Akhir/App/Run-IO/android/app/build/outputs/apk/release/Run-IO.apk',
            'appium:noReset': false,
            'appium:autoGrantPermissions': true
        };

        driver = await remote({
            protocol: 'http',
            hostname: '127.0.0.1',
            port: 4723,
            path: '/',
            capabilities
        });
    });

    after(async () => {
        if (driver) {
            await driver.deleteSession();
        }
    });

    it('Register to Recommendations Flow', async () => {
        const welcomeButton = await driver.$('android=new UiSelector().resourceId("start-running-button")');
        await welcomeButton.click();
        
        await driver.execute('mobile: shell', {
            command: 'pm grant com.josey34.RunIO android.permission.ACCESS_FINE_LOCATION'
        });
        await driver.execute('mobile: shell', {
            command: 'pm grant com.josey34.RunIO android.permission.ACCESS_COARSE_LOCATION'
        });
        
        // 1. Navigate to Register Screen
        const registerLink = await driver.$('android=new UiSelector().resourceId("register-link-button")');
        await registerLink.click();

        // 2. Register and Login Screen
        await driver.$('android=new UiSelector().resourceId("username-register-input")').setValue('Test User');
        await driver.$('android=new UiSelector().resourceId("email-register-input")').setValue('test@example.com');
        await driver.$('android=new UiSelector().resourceId("password-register-input")').setValue('password123');
        await driver.$('android=new UiSelector().resourceId("register-submit-button")').click();
        
        await driver.$('android=new UiSelector().resourceId("email-login-input")').setValue('test@example.com');
        await driver.$('android=new UiSelector().resourceId("password-login-input")').setValue('password123');
        await driver.$('android=new UiSelector().resourceId("login-submit-button")').click();
        // Wait for login to complete

        // Wait for warning screen
        const warningTitle = await driver.$('android=new UiSelector().resourceId("warning-modal-ok-button")');
        await warningTitle.waitForDisplayed({ timeout: 5000 });

        // 3. Warning Screen
        const yesButton = await driver.$('android=new UiSelector().resourceId("warning-modal-ok-button")');
        await yesButton.click();
        
        const noButton = await driver.$('android=new UiSelector().resourceId("warning-modal-no-button")');
        await noButton.click();

        // Wait for form screen
        const formTitle = await driver.$('android=new UiSelector().text("Fill in your data")');
        await formTitle.waitForDisplayed({ timeout: 5000 });

        // 4. Form Data Screen
        await driver.$('android=new UiSelector().resourceId("age-input")').setValue('25');
        await driver.$('android=new UiSelector().resourceId("weight-input")').setValue('70');
        await driver.$('android=new UiSelector().resourceId("height-input")').setValue('170');
        await driver.$('android=new UiSelector().resourceId("android:id/text1")').click();
        await driver.$('android=new UiSelector().text("Man")').click();
        await driver.$('android=new UiSelector().resourceId("process-button")').click();
        
        //Go to challenges screen
        const challengesButton = await driver.$('android=new UiSelector().resourceId("tab-challenge_screen")');
        await challengesButton.click();

        // Wait for challenges screen
        const challengesTitle = await driver.$('android=new UiSelector().text("Challenges")');
        await challengesTitle.waitForDisplayed({ timeout: 5000 });

        // 5. Verify Recommendations
        const recommendationElement = await driver.$('android=new UiSelector().resourceId("challenge-X9GdKeNtCTS93j2rdmqd-distance")');
        await recommendationElement.isDisplayed();
    });
});