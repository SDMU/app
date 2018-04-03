<?php
namespace Wikia\Service\Gateway;

use Generator;
use Psr\Log\NullLogger;
use WikiaBaseTest;

class KubernetesExternalUrlProviderTest extends WikiaBaseTest {
	/**
	 * @dataProvider provideEnvironmentDatacenterAndServiceName
	 *
	 * @param string $wgServicesExternalDomain
	 * @param string $serviceName
	 */
	public function testConstructsCorrectKubernetesUrlForProdEnvironment(
		string $wgServicesExternalDomain, string $serviceName
	) {
		$this->mockProdEnv();
		$kubernetesUrlProvider = new KubernetesExternalUrlProvider( );
		$kubernetesUrlProvider->setLogger( new NullLogger() );

		$this->assertEquals(
			"$wgServicesExternalDomain/$serviceName",
			$kubernetesUrlProvider->getUrl( $serviceName )
		);
	}

	public function provideEnvironmentAndServiceName(): Generator {
		yield [ "https://services.wikia.com", 'example' ];
	}

	/**
	 * @dataProvider provideDevEnvironmentAndServiceName
	 *
	 * @param string $wgServicesExternalDomain
	 * @param string $serviceName
	 */
	public function testConstructsCorrectKubernetesUrlForDevEnvironment(
		string $wgServicesExternalDomain, string $serviceName
	) {
		$this->mockDevEnv();
		$kubernetesUrlProvider = new KubernetesExternalUrlProvider( );
		$kubernetesUrlProvider->setLogger( new NullLogger() );

		$this->assertEquals(
			"$wgServicesExternalDomain/$serviceName",
			$kubernetesUrlProvider->getUrl( $serviceName )
		);
	}

	public function provideDevEnvironmentAndServiceName(): Generator {
		yield [ "https://services.wikia-dev.us", 'example' ];
	}
}
