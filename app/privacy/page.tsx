"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-4">
      <Card className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <CardHeader className="bg-gray-100 dark:bg-gray-700 p-6 rounded-t-lg">
          <CardTitle className="text-4xl font-bold text-gray-800 dark:text-gray-100 text-center">
            Privacy Policy
          </CardTitle>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200 py-4">
            This Privacy Policy will explain how our Company uses the personal
            data we collect from you when you use our website.
          </h2>
          <div className="flex justify-center mt-6">
            <Image
              src="/eljardinlogo.JPG"
              alt="El Jardin Logo"
              width={100}
              height={100}
              className="rounded-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6 text-gray-700 dark:text-gray-300">
          <p className="leading-relaxed">
            At El Jardin Verde we highly prioritize protecting your personal
            information and being transparent about what we do with it.
            <br />
            <br />
            We are committed to using your personal information following all
            applicable laws concerning the protection of personal information
            and ensuring that you understand your data rights and freedoms.{" "}
            <br />
            <br />
            El Jardin Verde will be considered as the &ldquo;controllers&ldquo; of your
            data. We determine which personal data we need to process and for
            what purpose and are responsible for the safe storage and handling
            of this data. <br />
            <br /> First, we need to define, and it is important for you to
            understand, the expression: &ldquo;Personal Data&ldquo; (PD). It generically
            represents any kind of information about a physical person, whose
            particularities can lead, directly or indirectly, to its
            identification. Here you have, by way of example, but not limited
            to: name and surname, geographical address, any identification
            number, political orientation, sexual orientation, email address,
            any location information and any other online identifier such as the
            device used to access the Internet, IP address, or cookie
            information. <br />
            <br />
            With regards of your agreement on collection and use of personal
            data, we have taken all the necessary technical measures to provide
            you with this detailed agreement, so you can have a crisp clear
            experience, from the first to the last interaction with our website
            or our services. Visitors and Users agree and accept that the use of
            our website is not possible without any indication of personal data.
            <br />
            <br />
            In your relationship with us through the website, controller, for
            the purposes of the General Data Protection Regulation (GDPR), other
            data protection laws applicable in Member states of the European
            Union and other provisions related to data protection, is: El Jardin
            Verde Association, an entity registered at Cartier San Eugenio,
            Calle Gran Bretaña 18 local 2, Centro Comercial Krystal, 38660
            Adeje, Tenerife. <br />
            <br />
            This Policy does not apply to other companies or Companys websites
            to which we may link to or may link to us. You should carefully
            review the privacy policies of those sites in order to determine how
            they treat your personal information.
            <br />
            <br />
            If you do not agree to this Privacy Policy, please exit, and do not
            access or use our website.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            Definitions
          </h2>
          <p className="leading-relaxed">
            Our data protection policy should be legible and understandable for
            the general public, as well as for our Users and business partners.
            To ensure this, we would like to first explain the terminology used.
            In this data protection declaration, we use, inter alia, the
            following terms:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Data Subject or Data Principal - is any identified or identifiable
              natural person, whose personal data is collected and processed by
              us.
            </li>
            <li>
              Processing - is any operation which is performed on personal data,
              such as collection, recording, Company, structuring, storage, etc.{" "}
            </li>
            <li>
              Profiling - means any form of automated processing of personal
              data consisting of the use of personal data to evaluate certain
              personal aspects relating to a natural person.
            </li>
            <li>
              Data Controller or Data Fiduciary - is the natural or legal
              person, public authority, agency or other body, which determines
              the purposes and means of the processing of personal data;
            </li>
            <li>
              Processor - is a natural or legal person, public authority, agency
              or other body which processes personal data on behalf of the
              controller.
            </li>
            <li>
              Recipient - is a natural or legal person, public authority, agency
              or another body, to which the personal data are disclosed. The
              processing of those data by those public authorities shall be in
              compliance with the applicable data protection rules according to
              the purposes of the processing.
            </li>
            <li>
              Third-party - is a natural or legal person, public authority,
              agency or body other than the ones above, who, under the direct
              authority of the controller or processor, are authorized to
              process personal data.
            </li>
            <li>
              Consent - is any freely given, specific, informed and unambiguous
              indication of data subjects acceptance to the processing of their
              personal data.
            </li>
          </ul>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            Compliance
          </h2>
          <p className="leading-relaxed">
            The processing of personal data will be in line with these main
            international legislations: <br />
            <br /> General Data Protection Regulation (GDPR), applicable in
            Europe; <br />
            <br />
            California Consumer Privacy Act (2018) and <br />
            <br />
            Privacy Act U.S.C. 552a (Privacy Act of USA);
          </p>
          <p className="leading-relaxed">
            We are able to provide our services worldwide. For the purpose of
            avoiding any compliance conflict with any terminology used by any
            particular legislation, in this document: “Users” are the “data
            subjects” or the “data principals” and El Jardin Verde is the “data
            controller” or “data fiduciary” Our privacy notice tells you what
            personal data (PD) and non-personal data (NPD) we may collect from
            you, how we collect it, how we protect it, how we may share it, how
            you can access and change it, and how you can limit our sharing of
            it. <br />
            <br />
            Our privacy notice also explains certain legal rights that you have
            with respect to your personal data. Any capitalized terms not
            defined herein will have the same meaning as where they are defined
            elsewhere on our website.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: [Insert Date]
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            Automated individual decision-making and profiling
          </h2>
          <p className="leading-relaxed">
            You will have the right not to be subject to a decision based solely
            on automated processing, including profiling, which produces legal
            effects concerning you or similarly significantly affects you.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            Filing a complaint with authorities
          </h2>
          <p className="leading-relaxed">
            You have the right to file a complaint with supervisory authorities
            if your information has not been processed in compliance with any
            applicable data protection law. If the supervisory authorities fail
            to address your complaint properly, you may have the right to a
            judicial remedy.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            Use Cases
          </h2>
          <p className="leading-relaxed">
            Please take a moment to understand which use case(s) set out in this
            Privacy Policy apply to you:
            <br />
            <br /> Website Visitor <br />
            <br />
            You are a “Website Visitor” by definition when you visit our website
            and any other eventual subdomains associated with our principal
            domain. As a website visitor, we use your navigation statistical
            information for our own purposes, primarily for improving the use of
            our website and to provide you with more relevant content.
            <br />
            <br /> User
            <br />
            <br /> You become a “User” if you create an account on our
            website/platform in order to benefit of our services. If you are a
            User, our primary purpose of using your personal data is for
            providing the service and the services to you. We retain your
            personal information for a limited time and for limited purposes,
            such as to make it easier for you to re-join our service in the
            future or to wish you offers for services that we think you may be
            interested in.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            What data do we collect?
          </h2>
          <p className="leading-relaxed">
            Upon acquisition of our services, we will ask for your full name and
            a valid e-mail address, which will be included in our mailing list,
            for future maintenance, updates, and eventual marketing promotions.
            In addition, we will ask you to provide us with secure payment data,
            which will be used for processing the order. This particular set of
            data will be legally processed by our payment processor, and will
            not be stored by us.
            <br />
            <br /> We may process data about your use of our website and
            services, or the Users website (&ldquo;usage data&ldquo;). The usage data may
            include your IP address, geographical location, browser type, and
            version, operating system, referral source, length of visit, page
            views and website navigation paths, as well as information about the
            timing, frequency and pattern of your service use. The source of the
            usage data is our analytics tracking system. This usage data may be
            processed for the purposes of analyzing the use of the website and
            services. <br />
            <br />
            We may process your personal data that are provided in the course of
            the use of our services (&ldquo;service data&ldquo;). The service data may be
            processed for the purposes of providing our services, ensuring the
            security of our website and services, maintaining back-ups of our
            databases and communicating with you. <br />
            <br />
            We may process information contained in any inquiry you submit to us
            regarding services and/or services (&ldquo;inquiry data&ldquo;). The inquiry
            data may be processed for the purposes of providing our services,
            ensuring the security of our website and services, maintaining
            back-ups of our databases and communicating with you.
            <br />
            <br /> We may process information relating to our User
            relationships, including User contact information (&ldquo;User
            relationship data&ldquo;). The User relationship data may include your
            name, your employer, your job title or role, all your contact
            details, and information contained in communications between us and
            you or your employer. The User relationship data may be processed
            for the purposes of providing our services, ensuring the security of
            our website and services, maintaining back-ups of our databases and
            communicating with you. <br />
            <br />
            We may process information relating to transactions, including
            purchases of services, that you enter into with us and/or through
            our services (&ldquo;transaction data&ldquo;). The transaction data may include
            your contact details and the transaction details. The transaction
            data may be processed for the purposes of providing our services,
            ensuring the security of our website and services, maintaining
            back-ups of our databases and communicating with you. <br />
            <br />
            We may process information contained in or relating to any
            communication that you send to us (&ldquo;correspondence data&ldquo;). The
            correspondence data may include the communication content and
            metadata associated with the communication. Our website will
            generate the metadata associated with communications made using the
            website contact forms. The correspondence data may be processed for
            the purposes of providing our services, ensuring the security of our
            website and services, maintaining back-ups of our databases and
            communicating with you.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
          &ldquo;Automatically Collected&ldquo; Information:
          </h2>
          <p className="leading-relaxed">
            The website collects a series of general data and information when a
            data subject or automated system calls up the website. This general
            data and information are stored in the server log files, and it is
            collected regardless of your quality: Website Visitor or User.
          </p>
          <p className="leading-relaxed">Collected may be:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>the ISP,</li>
            <li>the operating system used by the accessing system</li>
            <li>
              the website from which an accessing system reaches our website
              (so-called referrers)
            </li>
            <li>the sub-website</li>
            <li>the date and time of access to the website </li>
            <li>an Internet Protocol address (IP address)</li>
            <li>screen Resolution</li>
            <li>locale Preferences</li>
            <li>web page visited before you came to our website</li>
            <li>information you search for on our website</li>
            <li>date and time stamps associated with transactions</li>
            <li>
              system configuration information and other interactions with the
              website.
            </li>
            <li>
              social networking information (if we are provided with access to
              your account on social network connection services);
            </li>
            <li>
              any other similar data and information that may be used in the
              event of attacks on our information technology systems.
            </li>
          </ul>
          <p className="leading-relaxed">
            When using these general data and information, we do not draw any
            conclusions about the data subject. Rather, this information is
            needed to:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>deliver the content of our website correctly; </li>
            <li>
              optimize the content of our website as well as its advertisement;
            </li>
            <li>
              ensure the long-term viability of our information technology
              systems and website technology;
            </li>
            <li>
              provide law enforcement authorities with the information necessary
              for criminal prosecution in case of a cyber-attack;
            </li>
          </ul>
          <p className="leading-relaxed">
            In addition to the specific purposes for which we may process your
            personal data set out in this Section, we may also process any of
            your personal data where such processing is necessary for compliance
            with a legal obligation to which we are subject, or in order to
            protect your vital interests or the vital interests of another
            natural person. <br /> <br />
            Please do not supply any other persons personal data to us, unless
            we prompt you to do so. <br /> <br />
            Obviously, the access to our website for website visitors is free;
            however, we inform you that for the use of the website via mobile
            device the charges and the standard tariffs provided in the service
            contract that you have stipulated with them will still be applied by
            the telephone operators.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            How do we collect your data?
          </h2>
          <p className="leading-relaxed">
            You directly provide El Jardin Verde with most of the data
            collected. We collect data and process data when you avail our
            products and services.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            What is the purpose of collection?
          </h2>
          <p className="leading-relaxed">
            Our commercial purpose, by reference to the subject matter of our
            business, is provision of special private club services in the
            Tenerife. Reports in the financial domain and other complementary
            services, and the new rules of personal data protection (GDPR, CCPA,
            etc.) are part of this context.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            Complementary purposes
          </h2>
          <p className="leading-relaxed">
            To improve our services. <br /> <br />
            We always want to offer you the best online experience and for this
            we can collect and use certain information about your behavior and
            preferences when using the website and platform, or we can conduct
            market research directly or through partners. <br /> <br />
            To improve your marketing activity <br /> <br />
            We may want to keep you informed about the best offers for the
            services you may be interested in. In this sense, we may send you
            any type of message (such as: email / SMS / phone / mobile push /
            web push / etc.) containing general and thematic information about
            products or services, information on offers or promotions, as well
            as other commercial communications. <br /> <br />
            To defend our legitimate interests <br /> <br />
            There may be situations in which we use or transmit information to
            protect our rights and our commercial activity. These situations may
            include: <br /> <br /> - measures to protect the website and
            platform Visitors and Users against cyber-attacks; <br /> <br /> -
            measures to prevent and detect fraud attempts;
            <br /> <br /> - transmission of information to the competent public
            authorities; <br /> <br /> - other risk management measures. <br />{" "}
            <br />
            We therefore commit ourselves:
            <br /> <br /> - to protect the privacy of your data, which is a top
            priority for our companys management; <br /> <br /> - to use this
            data for the sole purpose of providing you with a personalized
            experience on our website as well as on the online platforms that we
            promote our products and services (Facebook and Google, etc.).
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            How do we store your data?
          </h2>
          <p className="leading-relaxed">
            El Jardin Verde securely stores your data at third-party dedicated
            server located in the European Union.
            <br /> <br /> We do not use the information you provide to make any
            automated decisions that might affect you.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            Our Legal Basis for Collecting and Processing Personal Data
          </h2>
          <p className="leading-relaxed">
            Our legal basis for collecting and processing your personal data
            when you buy request our services is based on the necessity for the
            performance of a contract or to take steps to enter into a contract.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            What Happens If You Do Not Give Us Your Personal Data
          </h2>
          <p className="leading-relaxed">
            If you do not provide us with enough Personal Data, we may not be
            able to provide you with our services. However, you can access and
            use some parts of our website (not our platform) without giving us
            your Personal Data.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            What are your data protection rights?
          </h2>
          <p className="leading-relaxed">
            El Jardin Verde would like to make sure you are fully aware of all
            of your data protection rights. Every user is entitled to the
            following: <br /> <br />
            The right to be informed - You have the right to be informed about
            the personal data we collect from you, and how we process it. <br />
            <br />
            The right to access - You have the right to request El Jardin Verde
            for copies of your personal data. We may charge you a small fee for
            this service. <br /> <br />
            The right to rectification - You have the right to request that El
            Jardin Verde correct any information you believe is inaccurate. You
            also have the right to request El Jardin Verde to complete the
            information you believe is incomplete.
            <br /> <br />
            The right to erasure - You have the right to request that El Jardin
            Verde erase your personal data, under certain conditions. <br />{" "}
            <br />
            The right to restrict processing - You have the right to request
            that El Jardin Verde restrict the processing of your personal data,
            under certain conditions.
            <br /> <br /> The right to object to processing - You have the right
            to object to El Jardin Verde`s processing of your personal data,
            under certain conditions.
            <br /> <br /> The right to data portability - You have the right to
            request that El Jardin Verde transfer the data that we have
            collected to another Company, or directly to you, under certain
            conditions. <br /> <br />
            If you make a request, we have one month to respond to you. If you
            would like to exercise any of these rights, please contact us via
            email: eljardinverde.clubsocial@yahoo.com.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            Cookies Policy
          </h2>
          <p className="leading-relaxed">
            Cookies are text files placed on your computer to collect standard
            Internet log information and visitor behavior information. When you
            visit our websites, we will collect information from you
            automatically through cookies or similar technology For further
            information, visit allaboutcookies.org.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            How do we use cookies?
          </h2>
          <p className="leading-relaxed">
            El Jardin Verde uses cookies in a range of ways to improve your
            experience on our website, including:
            <br /> <br /> - Keeping you signed in
            <br /> <br /> - Understanding how you use our website
            <br /> <br /> - To authenticate you .
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            What types of cookies do we use?
          </h2>
          <p className="leading-relaxed">
            There are several different types of cookies, however, our website
            uses: <br /> <br /> Functionality - El Jardin Verde uses these
            cookies so that we recognize you on our website and remember your
            previously selected preferences. These could include what language
            you prefer and the location you are in. A mix of first-party and
            third-party cookies are used. El Jardin Verde uses these cookies to
            collect information about your visit to our website, the content you
            viewed, the links you followed, and information about your browser,
            device, and your IP address. <br /> <br /> Strictly Necessary
            cookies - let you move around the website and use essential features
            like secure areas. Without these cookies, we cannot provide the
            requested services.We use these strictly necessary cookies to:
            Identify you as being logged in to the website and to authenticate
            you Make sure you connect to the right service on the website when
            we make any changes to the way it works For security purposes <br />
            <br /> &ldquo;Performance&ldquo; cookies - collect information about how you use
            the website, e.g. which pages you visit, and if you experience any
            errors. These cookies do not collect any information that could
            identify you and are only used to help us improve how the website
            works. We use performance cookies to:
            <br /> <br /> • Help us improve the website by measuring any errors
            that occur
            <br /> <br /> • Test different designs for the website
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            How to manage cookies
          </h2>
          <p className="leading-relaxed">
            You can set your browser not to accept cookies, allaboutcookies.org
            tells you how to remove cookies from your browser. However, in a few
            cases, some of our website features may not function as a result.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            Privacy policies of other websites
          </h2>
          <p className="leading-relaxed">
            The El Jardin Verde website/platform contains links to other
            websites. Our privacy policy applies only to our website, so if you
            click on a link to another website, you should read their privacy
            policy.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            Changes to our privacy policy
          </h2>
          <p className="leading-relaxed">
            El Jardin Verde keeps its privacy policy under regular review and
            places any updates on this web page. This privacy policy was last
            updated on 01 November 2021.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            How to contact us
          </h2>
          <p className="leading-relaxed">
            If you have any questions about El Jardin Verde`s privacy policy,
            the data we hold on you, or you would like to exercise one of your
            data protection rights, please do not hesitate to contact us at :
            eljardinverde.clubsocial@yahoo.com.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            Sharing Information with Affiliates and Other Third Parties
          </h2>
          <p className="leading-relaxed">
            We do not sell or rent your PD to third-parties for marketing
            purposes. You understand, and we undertake, that we will provide
            your PD through our platform strictly to the corporate stakeholders
            that are using our platform. However, for data aggregation purposes
            we may use your non PD, which might be sold to other parties at our
            discretion. Any such data aggregation would not contain any of your
            PD. We may provide your PD to third-party service providers we hire
            to provide services to us. These third-party service providers may
            include but are not limited to: payment processors, web analytics
            companies, advertising networks, call centers, data management
            services, help desk providers, accountants, law firms, auditors,
            shopping cart and email service providers, and shipping companies.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            Retaining and Destroying Your PD
          </h2>
          <p className="leading-relaxed">
            We only retain the personal information collected from a User for as
            long as the Users account is active on our platform, or otherwise
            for a limited period of time as long as we need it to fulfill the
            purposes for which we have initially collected it, unless otherwise
            required by law. <br /> In some cases, it is not possible for us to
            specify in advance the periods for which your personal data will be
            retained. In such cases, we will determine the period of retention
            based on the 2-year criteria, after your relationship with us ends.
            <br /> <br />
            We may retain your personal data where such retention is necessary
            for compliance with a legal obligation to which we are subject, or
            in order to protect your vital interests or the vital interests of
            another natural person.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            California Privacy Rights
          </h2>
          <p className="leading-relaxed">
            In addition to the rights provided for above, if you are a
            California or US resident, you have the right to request information
            from us regarding whether we share certain categories of your
            personal information with third parties for the third parties
            direct marketing purposes. To the extent we share your personal
            information in this way, you may receive the following information:
            <br />
            (a) the categories of information we disclosed to third parties for
            the third parties direct marketing purposes during the preceding
            calendar year; and <br />
            (b) the names and addresses of third parties that received such
            information, or if the nature of their business cannot be determined
            from the name, then examples of the products or services marketed.{" "}
            <br /> <br />
            Effective January 1, 2020, pursuant to the California Consumer
            Privacy Act of 2018 (&ldquo;CCPA&ldquo;), California residents have certain
            rights in relation to their personal information, subject to limited
            exceptions. Any terms defined in the CCPA have the same meaning when
            used in this California Privacy Rights section. <br /> <br />
            For personal information collected by us during the preceding 12
            months that is not otherwise subject to an exception, California
            residents have the right to access and delete their personal
            information. El Jardin Verde will not discriminate against those who
            exercise their rights. Specifically, if you exercise your rights, we
            will not deny you services, charge you different prices for services
            or provide you a different level or quality of services. <br />{" "}
            <br /> To the extent we sell your personal information to third
            parties, you also have the right to request that we disclose to you:
            (i) the categories of your personal information that we sold, and
            (ii) the categories of third parties to whom your personal
            information was sold. You have the right to direct us not to sell
            your personal information. El Jardin Verde does not sell your
            personal information in its ordinary course of business and will
            never sell your personal information to third parties without your
            explicit consent. <br /> <br />
            Should El Jardin Verde engage in any of the activities listed in
            this section, your ability to exercise these rights will be made
            available to you in your account settings. You can exercise your
            rights by going contacting us via email so that we may consider your
            request.
            <br /> <br /> If you are a US resident, you may designate an
            authorized agent to make a request to access or a request to delete
            on your behalf. We will respond to your authorized agents request
            if they submit proof that they are registered with the California
            Secretary of State to be able to act on your behalf, or submit
            evidence you have provided them with power of attorney pursuant to
            California Probate Code section 4000 to 4465. We may deny requests
            from authorized agents who do not submit proof that they have been
            authorized by you to act on their behalf, or are unable to verify
            their identity.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            Transferring PD From the European Economic Area
          </h2>
          <p className="leading-relaxed">
            PD that we collect from you may be stored, processed, and
            transferred between any of the countries in which we operate. The
            European Union and the UK has not found the United States and some
            other countries to have an adequate level of protection of PD under
            Article 45 of the GDPR. Our company relies on derogations for
            specific situations as defined in Article 49 of the GDPR. For
            European Union customers and users, with your consent, your PD may
            be transferred outside the European Union to the United States and
            or other countries. We will use your PD to provide the services,
            and/or information you request from us to perform a contract with
            you or to satisfy a legitimate interest of our company in a manner
            that does not outweigh your freedoms and rights. Wherever we
            transfer, process or store your PD, we will take reasonable steps to
            protect it. We will use the information we collect from you in
            accordance with our privacy notice. By using our website, services,
            or products, you agree to the transfers of your PD described within
            this section.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            Changes to Our Privacy Policy
          </h2>
          <p className="leading-relaxed">
            We reserve the right to change this privacy notice at any time. If
            our company decides to change this privacy notice, we will post
            those changes on our website so that our users and customers are
            always aware of what information we collect, use, and disclose. If
            at any time we decide to disclose or use your PD in a method
            different from that specified at the time it was collected, we will
            provide advance notice by email (sent to the email address on file
            in your account). Otherwise we will use and disclose our users and
            customers PD in agreement with the privacy notice in effect when the
            information was collected. In all cases, your continued use of our
            website, services, and products after any change to this privacy
            notice will constitute your acceptance of such change.
          </p>
        </CardContent>
      </Card>

      <div className="mt-8 text-center mb-6">
        <Link href="/">
          <Button variant="secondary" className="px-6 py-3 text-lg">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
