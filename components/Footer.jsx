import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-block text-2xl font-bold tracking-tight text-white"
            >
              Welcome<span className="text-blue-500">Shop</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              Everything you need, all in one place. Discover useful,
              quality products for everyday life at WelcomeShop.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white transition hover:bg-blue-600"
              >
                IG
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white transition hover:bg-blue-600"
              >
                f
              </a>

              <a
                href="#"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white transition hover:bg-green-600"
              >
                WA
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="transition hover:text-blue-400"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/products"
                  className="transition hover:text-blue-400"
                >
                  Products
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className="transition hover:text-blue-400"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="transition hover:text-blue-400"
                >
                  Contact
                </Link>
              </li>

              <li>
                <Link
                  href="/login"
                  className="transition hover:text-blue-400"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Categories
            </h3>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  href="/products?category=herbal-products"
                  className="transition hover:text-blue-400"
                >
                  Herbal Products
                </Link>
              </li>

              <li>
                <Link
                  href="/products?category=stationery-items"
                  className="transition hover:text-blue-400"
                >
                  Stationery Items
                </Link>
              </li>

              <li>
                <Link
                  href="/products?category=gift-items"
                  className="transition hover:text-blue-400"
                >
                  Gift Items
                </Link>
              </li>

              <li>
                <Link
                  href="/products?category=mobile-accessories"
                  className="transition hover:text-blue-400"
                >
                  Mobile Accessories
                </Link>
              </li>

              <li>
                <Link
                  href="/products?category=diapers"
                  className="transition hover:text-blue-400"
                >
                  Diapers
                </Link>
              </li>

              <li>
                <Link
                  href="/products?category=home-useful-items"
                  className="transition hover:text-blue-400"
                >
                  Home Useful Items
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact Us
            </h3>

            <ul className="mt-5 space-y-4 text-sm">

              {/* WhatsApp */}
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-lg">💬</span>

                <div>
                  <p className="text-xs text-slate-500">
                    WhatsApp
                  </p>

                  <a
                    href="https://wa.me/YOUR_NUMBER"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block transition hover:text-green-400"
                  >
                    Chat with us
                  </a>
                </div>
              </li>

              {/* Phone */}
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-lg">📞</span>

                <div>
                  <p className="text-xs text-slate-500">
                    Phone
                  </p>

                  <a
                    href="tel:YOUR_PHONE_NUMBER"
                    className="mt-1 block transition hover:text-blue-400"
                  >
                    YOUR PHONE NUMBER
                  </a>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-lg">✉️</span>

                <div>
                  <p className="text-xs text-slate-500">
                    Email
                  </p>

                  <a
                    href="mailto:YOUR_EMAIL"
                    className="mt-1 block break-all transition hover:text-blue-400"
                  >
                    YOUR_EMAIL
                  </a>
                </div>
              </li>

              {/* Location */}
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-lg">📍</span>

                <div>
                  <p className="text-xs text-slate-500">
                    Location
                  </p>

                  <p className="mt-1">
                    Your City, India
                  </p>
                </div>
              </li>

            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-center text-xs text-slate-500 sm:px-8 md:flex-row md:text-left lg:px-10">

          <p>
            © {new Date().getFullYear()} WelcomeShop. All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="transition hover:text-slate-300"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-slate-300"
            >
              Terms & Conditions
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}