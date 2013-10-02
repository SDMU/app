@ie6-bug  @ie7-bug  @ie8-bug  @ie9-bug @ie10-bug @test2.wikipedia.org @login
Feature: VisualEditor Bullets, Numbering, Indent, Outdent

  Background:
    Given I am logged in
      And I am at my user page
      And I click Edit for VisualEditor
      And I type in an input string
      And select the string

  Scenario: Check indentation controls disabled by default
    Then Decrease indentation should be disabled
      And Increase indentation should be disabled

  Scenario: Check indentation controls enabled upon creating Bullet
    When I click Bullets
    Then Decrease indentation should be enabled
       And Increase indentation should be enabled

  Scenario: Check indentation controls enabled upon creating Numbering
    When I click Numbering
    Then Decrease indentation should be enabled
       And Increase indentation should be enabled

  Scenario: Check indentation controls disabled upon undoing Bullet
    When I click Bullets
      And  I undo Bullets
    Then Decrease indentation should be disabled
       And Increase indentation should be disabled

  Scenario: Check indentation controls enabled upon creating Numbering
    When I click Numbering
      And I undo Numbering
    Then Decrease indentation should be disabled
       And Increase indentation should be disabled